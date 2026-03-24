import * as fs from 'fs-extra';
import { join } from 'path';
import { ASSETS_DIR } from 'twenty-shared/application';
import { v4 } from 'uuid';

import { type ExampleOptions } from '@/types/scaffolding-options';
import { scaffoldIntegrationTest } from '@/utils/test-template';
import createTwentyAppPackageJson from 'package.json';

const SRC_FOLDER = 'src';

export const copyBaseApplicationProject = async ({
  appName,
  appDisplayName,
  appDescription,
  appDirectory,
  exampleOptions,
}: {
  appName: string;
  appDisplayName: string;
  appDescription: string;
  appDirectory: string;
  exampleOptions: ExampleOptions;
}) => {
  await fs.copy(join(__dirname, './constants/base-application'), appDirectory);

  await createPackageJson({
    appName,
    appDirectory,
    includeExampleIntegrationTest: exampleOptions.includeExampleIntegrationTest,
  });

  await createYarnLock(appDirectory);

  await createGitignore(appDirectory);

  await createNvmrc(appDirectory);

  await createPublicAssetDirectory(appDirectory);

  const sourceFolderPath = join(appDirectory, SRC_FOLDER);

  await fs.ensureDir(sourceFolderPath);

  await createDefaultRoleConfig({
    displayName: appDisplayName,
    appDirectory: sourceFolderPath,
    fileFolder: 'roles',
    fileName: 'default-role.ts',
  });

  if (exampleOptions.includeExampleObject) {
    await createExampleObject({
      appDirectory: sourceFolderPath,
      fileFolder: 'objects',
      fileName: 'example-object.ts',
    });
  }

  if (exampleOptions.includeExampleField) {
    await createExampleField({
      appDirectory: sourceFolderPath,
      fileFolder: 'fields',
      fileName: 'example-field.ts',
    });
  }

  if (exampleOptions.includeExampleLogicFunction) {
    await createDefaultFunction({
      appDirectory: sourceFolderPath,
      fileFolder: 'logic-functions',
      fileName: 'hello-world.ts',
    });

    await createCreateCompanyFunction({
      appDirectory: sourceFolderPath,
      fileFolder: 'logic-functions',
      fileName: 'create-hello-world-company.ts',
    });
  }

  if (exampleOptions.includeExampleFrontComponent) {
    await createDefaultFrontComponent({
      appDirectory: sourceFolderPath,
      fileFolder: 'front-components',
      fileName: 'hello-world.tsx',
    });

    await createExamplePageLayout({
      appDirectory: sourceFolderPath,
      fileFolder: 'page-layouts',
      fileName: 'example-record-page-layout.ts',
    });
  }

  if (exampleOptions.includeExampleView) {
    await createExampleView({
      appDirectory: sourceFolderPath,
      fileFolder: 'views',
      fileName: 'example-view.ts',
    });
  }

  if (exampleOptions.includeExampleNavigationMenuItem) {
    await createExampleNavigationMenuItem({
      appDirectory: sourceFolderPath,
      fileFolder: 'navigation-menu-items',
      fileName: 'example-navigation-menu-item.ts',
    });
  }

  if (exampleOptions.includeExampleSkill) {
    await createExampleSkill({
      appDirectory: sourceFolderPath,
      fileFolder: 'skills',
      fileName: 'example-skill.ts',
    });
  }

  if (exampleOptions.includeExampleAgent) {
    await createExampleAgent({
      appDirectory: sourceFolderPath,
      fileFolder: 'agents',
      fileName: 'example-agent.ts',
    });
  }

  if (exampleOptions.includeExampleIntegrationTest) {
    await scaffoldIntegrationTest({
      appDirectory,
      sourceFolderPath,
    });
  }

  await createDefaultPreInstallFunction({
    appDirectory: sourceFolderPath,
    fileFolder: 'logic-functions',
    fileName: 'pre-install.ts',
  });

  await createDefaultPostInstallFunction({
    appDirectory: sourceFolderPath,
    fileFolder: 'logic-functions',
    fileName: 'post-install.ts',
  });

  await createApplicationConfig({
    displayName: appDisplayName,
    description: appDescription,
    appDirectory: sourceFolderPath,
    fileName: 'application-config.ts',
  });
};

const createPublicAssetDirectory = async (appDirectory: string) => {
  await fs.ensureDir(join(appDirectory, ASSETS_DIR));
};

const createGitignore = async (appDirectory: string) => {
  const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn

# codegen
generated

# testing
/coverage

# dev
/dist/

.twenty

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# typescript
*.tsbuildinfo
*.d.ts
`;

  await fs.writeFile(join(appDirectory, '.gitignore'), gitignoreContent);
};

const createNvmrc = async (appDirectory: string) => {
  await fs.writeFile(join(appDirectory, '.nvmrc'), '24.5.0\n');
};

const createDefaultRoleConfig = async ({
  displayName,
  appDirectory,
  fileFolder,
  fileName,
}: {
  displayName: string;
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { defineRole } from 'twenty-sdk';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: '${displayName} default function role',
  description: '${displayName} default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createDefaultFrontComponent = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { useEffect, useState } from 'react';
import { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk';

export const HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export const HelloWorld = () => {
  const client = new CoreApiClient();
  const [data, setData] = useState<
    Pick<CoreSchema.Company, 'name' | 'id'> | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const response = await client.query({
        company: {
          name: true,
          id: true,
          __args: {
            filter: {
              position: {
                eq: 1,
              },
            },
          },
        },
      });

      setData(response.company);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Hello, World!</h1>
      <p>This is your first front component.</p>
      {data ? (
        <div>
          <p>Company name: {data.name}</p>
          <p>Company id: {data.id}</p>
        </div>
      ) : (
        <p>Company not found</p>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createExamplePageLayout = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const pageLayoutUniversalIdentifier = v4();
  const tabUniversalIdentifier = v4();
  const widgetUniversalIdentifier = v4();

  const content = `import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';
import { HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/hello-world';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';

export default definePageLayout({
  universalIdentifier: '${pageLayoutUniversalIdentifier}',
  name: 'Example Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '${tabUniversalIdentifier}',
      title: 'Hello World',
      position: 50,
      icon: 'IconWorld',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '${widgetUniversalIdentifier}',
          title: 'Hello World',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createDefaultFunction = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { defineLogicFunction } from 'twenty-sdk';

const handler = async (): Promise<{ message: string }> => {
  return { message: 'Hello, World!' };
};

export default defineLogicFunction({
  universalIdentifier: '${universalIdentifier}',
  name: 'hello-world-logic-function',
  description: 'A simple logic function',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/hello-world-logic-function',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createCreateCompanyFunction = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk';

const handler = async (): Promise<{ message: string }> => {
  const client = new CoreApiClient();

  const { createCompany } = await client.mutation({
    createCompany: {
      __args: {
        data: {
          name: 'Hello World',
        },
      },
      id: true,
      name: true,
    },
  });

  return {
    message: \`Created company "\${createCompany?.name}" with id \${createCompany?.id}\`,
  };
};

export default defineLogicFunction({
  universalIdentifier: '${universalIdentifier}',
  name: 'create-hello-world-company',
  description: 'Creates a company called Hello World',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/create-hello-world-company',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createDefaultPreInstallFunction = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { definePreInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Pre install logic function executed successfully!', payload.previousVersion);
};

export default definePreInstallLogicFunction({
  universalIdentifier: '${universalIdentifier}',
  name: 'pre-install',
  description: 'Runs before installation to prepare the application.',
  timeoutSeconds: 300,
  handler,
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createDefaultPostInstallFunction = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { definePostInstallLogicFunction, type InstallLogicFunctionPayload } from 'twenty-sdk';

const handler = async (payload: InstallLogicFunctionPayload): Promise<void> => {
  console.log('Post install logic function executed successfully!', payload.previousVersion);
};

export default definePostInstallLogicFunction({
  universalIdentifier: '${universalIdentifier}',
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 300,
  handler,
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createExampleObject = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const objectUniversalIdentifier = v4();
  const nameFieldUniversalIdentifier = v4();

  const content = `import { defineObject, FieldType } from 'twenty-sdk';

export const EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER =
  '${objectUniversalIdentifier}';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '${nameFieldUniversalIdentifier}';

export default defineObject({
  universalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'exampleItem',
  namePlural: 'exampleItems',
  labelSingular: 'Example item',
  labelPlural: 'Example items',
  description: 'A sample custom object',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the example item',
      icon: 'IconAbc',
    },
  ],
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createExampleField = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { defineField, FieldType } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export default defineField({
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  universalIdentifier: '${universalIdentifier}',
  type: FieldType.NUMBER,
  name: 'priority',
  label: 'Priority',
  description: 'Priority level for the example item (1-10)',
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createExampleView = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();
  const viewFieldUniversalIdentifier = v4();

  const content = `import { defineView, ViewKey } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER, NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export const EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER = '${universalIdentifier}';

export default defineView({
  universalIdentifier: EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All example items',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '${viewFieldUniversalIdentifier}',
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createExampleNavigationMenuItem = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { defineNavigationMenuItem } from 'twenty-sdk';
import { EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/example-view';

export default defineNavigationMenuItem({
  universalIdentifier: '${universalIdentifier}',
  name: 'example-navigation-menu-item',
  icon: 'IconList',
  color: 'blue',
  position: 0,
  type: 'VIEW',
  viewUniversalIdentifier: EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER,
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createExampleSkill = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { defineSkill } from 'twenty-sdk';

export const EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineSkill({
  universalIdentifier: EXAMPLE_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'example-skill',
  label: 'Example Skill',
  description: 'A sample skill for your application',
  icon: 'IconBrain',
  content: 'Add your skill instructions here. Skills provide context and capabilities to AI agents.',
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createExampleAgent = async ({
  appDirectory,
  fileFolder,
  fileName,
}: {
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { defineAgent } from 'twenty-sdk';

export const EXAMPLE_AGENT_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineAgent({
  universalIdentifier: EXAMPLE_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'example-agent',
  label: 'Example Agent',
  description: 'A sample AI agent for your application',
  icon: 'IconRobot',
  prompt: 'You are a helpful assistant. Help users with their questions and tasks.',
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createApplicationConfig = async ({
  displayName,
  description,
  appDirectory,
  fileFolder,
  fileName,
}: {
  displayName: string;
  description?: string;
  appDirectory: string;
  fileFolder?: string;
  fileName: string;
}) => {
  const universalIdentifier = v4();

  const content = `import { defineApplication } from 'twenty-sdk';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: '${displayName}',
  description: '${description ?? ''}',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
`;

  await fs.ensureDir(join(appDirectory, fileFolder ?? ''));
  await fs.writeFile(join(appDirectory, fileFolder ?? '', fileName), content);
};

const createYarnLock = async (appDirectory: string) => {
  const yarnLockContent = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1
`;

  await fs.writeFile(join(appDirectory, 'yarn.lock'), yarnLockContent);
};

const createPackageJson = async ({
  appName,
  appDirectory,
  includeExampleIntegrationTest,
}: {
  appName: string;
  appDirectory: string;
  includeExampleIntegrationTest: boolean;
}) => {
  const scripts: Record<string, string> = {
    twenty: 'twenty',
    lint: 'oxlint -c .oxlintrc.json .',
    'lint:fix': 'oxlint --fix -c .oxlintrc.json .',
  };

  const devDependencies: Record<string, string> = {
    typescript: '^5.9.3',
    '@types/node': '^24.7.2',
    '@types/react': '^19.0.0',
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    oxlint: '^0.16.0',
    'twenty-sdk': createTwentyAppPackageJson.version,
    'twenty-client-sdk': createTwentyAppPackageJson.version,
  };

  if (includeExampleIntegrationTest) {
    scripts.test = 'vitest run';
    scripts['test:watch'] = 'vitest';
    devDependencies.vitest = '^3.1.1';
    devDependencies['vite-tsconfig-paths'] = '^4.2.1';
  }

  const packageJson = {
    name: appName,
    version: '0.1.0',
    license: 'MIT',
    engines: {
      node: '^24.5.0',
      npm: 'please-use-yarn',
      yarn: '>=4.0.2',
    },
    packageManager: 'yarn@4.9.2',
    scripts,
    devDependencies,
  };

  await fs.writeFile(
    join(appDirectory, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8',
  );
};
