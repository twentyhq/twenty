import { spawnSync } from 'node:child_process';
import { isAbsolute, join } from 'node:path';

import type {
  AppFactoryCommandExecution,
  AppFactoryPipelineResult,
  AppFactoryPipelineStageStatus,
  AppFactorySpec,
  NormalizedAppFactorySpec,
} from './app-factory-spec';
import { generateAppFactoryFiles } from './generator';
import { validateAppFactorySpec } from './spec-validation';

const getNpxBinary = (): string =>
  process.platform === 'win32' ? 'npx.cmd' : 'npx';

const getYarnBinary = (): string =>
  process.platform === 'win32' ? 'yarn.cmd' : 'yarn';

const runCommand = ({
  command,
  args,
  cwd,
  dryRun,
}: {
  command: string;
  args: string[];
  cwd: string;
  dryRun: boolean;
}): AppFactoryCommandExecution => {
  if (dryRun) {
    return {
      command,
      args,
      cwd,
      dryRun: true,
      skipped: true,
      success: true,
      exitCode: null,
      stdout: '',
      stderr: '',
    };
  }

  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
    env: process.env,
  });

  return {
    command,
    args,
    cwd,
    dryRun: false,
    skipped: false,
    success: result.status === 0,
    exitCode: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
};

const resolveAppDirectory = (
  spec: NormalizedAppFactorySpec,
  cwd: string,
): string =>
  isAbsolute(spec.app.directory) ? spec.app.directory : join(cwd, spec.app.directory);

const getPostInstallArgs = (spec: NormalizedAppFactorySpec): string[] | null => {
  if (!spec.pipeline.postInstall) {
    return null;
  }

  const args = ['twenty', 'exec', '--payload', spec.pipeline.postInstall.payload];

  if (spec.pipeline.postInstall.preInstall) {
    args.push('--preInstall');
  }

  if (spec.pipeline.postInstall.functionName) {
    args.push('--functionName', spec.pipeline.postInstall.functionName);
  }

  if (spec.pipeline.postInstall.functionUniversalIdentifier) {
    args.push(
      '--functionUniversalIdentifier',
      spec.pipeline.postInstall.functionUniversalIdentifier,
    );
  }

  if (
    !spec.pipeline.postInstall.preInstall &&
    !spec.pipeline.postInstall.functionName &&
    !spec.pipeline.postInstall.functionUniversalIdentifier
  ) {
    args.push('--postInstall');
  }

  return args;
};

const pushCommandAndStopOnFailure = ({
  commands,
  errors,
  command,
}: {
  commands: AppFactoryCommandExecution[];
  errors: string[];
  command: AppFactoryCommandExecution;
}): boolean => {
  commands.push(command);

  if (!command.success) {
    errors.push(
      `Command failed: ${command.command} ${command.args.join(' ')} (exit code ${command.exitCode ?? 'unknown'})`,
    );
    if (command.stderr.trim().length > 0) {
      errors.push(command.stderr.trim());
    }
    return true;
  }

  return false;
};

export const runAppFactoryPipeline = (
  rawSpec: unknown,
  options?: {
    cwd?: string;
  },
): AppFactoryPipelineResult => {
  const stages: AppFactoryPipelineStageStatus[] = [];
  const validationResult = validateAppFactorySpec(rawSpec);

  if (validationResult.success === false) {
    stages.push({
      name: 'validateSpec',
      success: false,
      skipped: false,
      details: validationResult.errors.join('; '),
    });
    return {
      success: false,
      appDirectory: '',
      generatedFiles: [],
      commands: [],
      stages,
      errors: validationResult.errors,
    };
  }

  stages.push({
    name: 'validateSpec',
    success: true,
    skipped: false,
  });

  const spec = validationResult.spec as AppFactorySpec & NormalizedAppFactorySpec;
  const cwd = options?.cwd ?? process.cwd();
  const appDirectory = resolveAppDirectory(spec, cwd);
  const commands: AppFactoryCommandExecution[] = [];
  const errors: string[] = [];

  const scaffoldArgs = [
    'create-twenty-app@latest',
    spec.app.directory,
    '--name',
    spec.app.name,
    '--display-name',
    spec.app.displayName,
    '--description',
    spec.app.description,
    '--yes',
  ];

  if (spec.app.example) {
    scaffoldArgs.push('--example', spec.app.example);
  }

  if (spec.app.skipLocalInstance) {
    scaffoldArgs.push('--skip-local-instance');
  }

  const scaffoldCommand = runCommand({
    command: getNpxBinary(),
    args: scaffoldArgs,
    cwd,
    dryRun: spec.pipeline.dryRun,
  });

  if (
    pushCommandAndStopOnFailure({
      commands,
      errors,
      command: scaffoldCommand,
    })
  ) {
    stages.push({
      name: 'scaffold',
      success: false,
      skipped: scaffoldCommand.skipped,
      details: errors[errors.length - 1],
    });
    return {
      success: false,
      appDirectory,
      generatedFiles: [],
      commands,
      stages,
      errors,
    };
  }

  stages.push({
    name: 'scaffold',
    success: true,
    skipped: scaffoldCommand.skipped,
  });

  const generationResult = generateAppFactoryFiles(appDirectory, spec, {
    writeToDisk: !spec.pipeline.dryRun,
  });
  stages.push({
    name: 'generateFiles',
    success: true,
    skipped: false,
    details: `generated ${generationResult.files.length} files`,
  });

  if (spec.pipeline.installDependencies) {
    const installCommand = runCommand({
      command: getYarnBinary(),
      args: ['install'],
      cwd: appDirectory,
      dryRun: spec.pipeline.dryRun,
    });

    if (
      pushCommandAndStopOnFailure({
        commands,
        errors,
        command: installCommand,
      })
    ) {
      stages.push({
        name: 'installDependencies',
        success: false,
        skipped: installCommand.skipped,
        details: errors[errors.length - 1],
      });
      return {
        success: false,
        appDirectory,
        generatedFiles: generationResult.files.map((file) => file.path),
        commands,
        stages,
        errors,
      };
    }

    stages.push({
      name: 'installDependencies',
      success: true,
      skipped: installCommand.skipped,
    });
  } else {
    stages.push({
      name: 'installDependencies',
      success: true,
      skipped: true,
      details: 'disabled by pipeline.installDependencies=false',
    });
  }

  if (spec.pipeline.buildTarball) {
    const buildCommand = runCommand({
      command: getNpxBinary(),
      args: ['twenty', 'build', '--tarball'],
      cwd: appDirectory,
      dryRun: spec.pipeline.dryRun,
    });

    if (
      pushCommandAndStopOnFailure({
        commands,
        errors,
        command: buildCommand,
      })
    ) {
      stages.push({
        name: 'buildTarball',
        success: false,
        skipped: buildCommand.skipped,
        details: errors[errors.length - 1],
      });
      return {
        success: false,
        appDirectory,
        generatedFiles: generationResult.files.map((file) => file.path),
        commands,
        stages,
        errors,
      };
    }

    stages.push({
      name: 'buildTarball',
      success: true,
      skipped: buildCommand.skipped,
    });
  } else {
    stages.push({
      name: 'buildTarball',
      success: true,
      skipped: true,
      details: 'disabled by pipeline.buildTarball=false',
    });
  }

  if (spec.pipeline.deploy) {
    const deployArgs = ['twenty', 'deploy'];

    if (spec.pipeline.remote) {
      deployArgs.push('--remote', spec.pipeline.remote);
    }

    const deployCommand = runCommand({
      command: getNpxBinary(),
      args: deployArgs,
      cwd: appDirectory,
      dryRun: spec.pipeline.dryRun,
    });

    if (
      pushCommandAndStopOnFailure({
        commands,
        errors,
        command: deployCommand,
      })
    ) {
      stages.push({
        name: 'deploy',
        success: false,
        skipped: deployCommand.skipped,
        details: errors[errors.length - 1],
      });
      return {
        success: false,
        appDirectory,
        generatedFiles: generationResult.files.map((file) => file.path),
        commands,
        stages,
        errors,
      };
    }

    stages.push({
      name: 'deploy',
      success: true,
      skipped: deployCommand.skipped,
    });
  } else {
    stages.push({
      name: 'deploy',
      success: true,
      skipped: true,
      details: 'disabled by pipeline.deploy=false',
    });
  }

  if (spec.pipeline.install) {
    const installArgs = ['twenty', 'install'];

    if (spec.pipeline.remote) {
      installArgs.push('--remote', spec.pipeline.remote);
    }

    const installCommand = runCommand({
      command: getNpxBinary(),
      args: installArgs,
      cwd: appDirectory,
      dryRun: spec.pipeline.dryRun,
    });

    if (
      pushCommandAndStopOnFailure({
        commands,
        errors,
        command: installCommand,
      })
    ) {
      stages.push({
        name: 'install',
        success: false,
        skipped: installCommand.skipped,
        details: errors[errors.length - 1],
      });
      return {
        success: false,
        appDirectory,
        generatedFiles: generationResult.files.map((file) => file.path),
        commands,
        stages,
        errors,
      };
    }

    stages.push({
      name: 'install',
      success: true,
      skipped: installCommand.skipped,
    });
  } else {
    stages.push({
      name: 'install',
      success: true,
      skipped: true,
      details: 'disabled by pipeline.install=false',
    });
  }

  const postInstallArgs = getPostInstallArgs(spec);

  if (postInstallArgs) {
    const postInstallCommand = runCommand({
      command: getNpxBinary(),
      args: postInstallArgs,
      cwd: appDirectory,
      dryRun: spec.pipeline.dryRun,
    });

    if (
      pushCommandAndStopOnFailure({
        commands,
        errors,
        command: postInstallCommand,
      })
    ) {
      stages.push({
        name: 'postInstallExec',
        success: false,
        skipped: postInstallCommand.skipped,
        details: errors[errors.length - 1],
      });
      return {
        success: false,
        appDirectory,
        generatedFiles: generationResult.files.map((file) => file.path),
        commands,
        stages,
        errors,
      };
    }

    stages.push({
      name: 'postInstallExec',
      success: true,
      skipped: postInstallCommand.skipped,
    });
  } else {
    stages.push({
      name: 'postInstallExec',
      success: true,
      skipped: true,
      details: 'pipeline.postInstall not provided',
    });
  }

  return {
    success: true,
    appDirectory,
    generatedFiles: generationResult.files.map((file) => file.path),
    commands,
    stages,
    errors,
  };
};
