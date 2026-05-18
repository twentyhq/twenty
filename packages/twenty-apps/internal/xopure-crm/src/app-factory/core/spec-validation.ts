import {
  APP_FACTORY_FIELD_TYPES,
  type AppFactoryLogicFunctionSpec,
  type AppFactoryObjectFieldSpec,
  type AppFactoryObjectSpec,
  type AppFactoryPipelineOptionsSpec,
  type AppFactoryPostInstallExecSpec,
  type AppFactorySpec,
  type AppFactoryValidationResult,
  type NormalizedAppFactoryPipelineOptions,
  type NormalizedAppFactoryPostInstallExec,
  type NormalizedAppFactorySpec,
} from './app-factory-spec';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const validateObjectField = (
  field: AppFactoryObjectFieldSpec,
  fieldPath: string,
): string[] => {
  const errors: string[] = [];

  if (!APP_FACTORY_FIELD_TYPES.includes(field.type)) {
    errors.push(
      `${fieldPath}.type must be one of ${APP_FACTORY_FIELD_TYPES.join(', ')}`,
    );
  }

  if (field.options) {
    if (field.type !== 'SELECT' && field.type !== 'MULTI_SELECT') {
      errors.push(
        `${fieldPath}.options is only allowed for SELECT or MULTI_SELECT fields`,
      );
    }

    if (field.options.length === 0) {
      errors.push(`${fieldPath}.options must not be empty when provided`);
    }

    for (const [index, option] of field.options.entries()) {
      const optionPath = `${fieldPath}.options[${index}]`;
      if (!isNonEmptyString(option.id)) {
        errors.push(`${optionPath}.id must be a non-empty string`);
      }
      if (!isNonEmptyString(option.value)) {
        errors.push(`${optionPath}.value must be a non-empty string`);
      }
      if (!isNonEmptyString(option.label)) {
        errors.push(`${optionPath}.label must be a non-empty string`);
      }
      if (
        option.position !== undefined &&
        (!Number.isInteger(option.position) || option.position < 0)
      ) {
        errors.push(`${optionPath}.position must be a non-negative integer`);
      }
      if (option.color !== undefined && !isNonEmptyString(option.color)) {
        errors.push(`${optionPath}.color must be a non-empty string when provided`);
      }
    }
  }

  return errors;
};

const validateObjectSpec = (
  objectSpec: AppFactoryObjectSpec,
  objectPath: string,
): string[] => {
  const errors: string[] = [];

  if (objectSpec.fields.length === 0) {
    errors.push(`${objectPath}.fields must include at least one field`);
  }

  const fieldNames = new Set<string>();
  const fieldUniversalIdentifiers = new Set<string>();

  for (const [index, field] of objectSpec.fields.entries()) {
    const fieldPath = `${objectPath}.fields[${index}]`;

    if (!isNonEmptyString(field.universalIdentifier)) {
      errors.push(`${fieldPath}.universalIdentifier must be a non-empty string`);
    }

    if (!isNonEmptyString(field.name)) {
      errors.push(`${fieldPath}.name must be a non-empty string`);
    }

    if (!isNonEmptyString(field.label)) {
      errors.push(`${fieldPath}.label must be a non-empty string`);
    }

    if (!isNonEmptyString(field.icon)) {
      errors.push(`${fieldPath}.icon must be a non-empty string`);
    }

    if (fieldNames.has(field.name)) {
      errors.push(`${fieldPath}.name must be unique within an object`);
    }

    if (fieldUniversalIdentifiers.has(field.universalIdentifier)) {
      errors.push(
        `${fieldPath}.universalIdentifier must be unique within an object`,
      );
    }

    fieldNames.add(field.name);
    fieldUniversalIdentifiers.add(field.universalIdentifier);

    errors.push(...validateObjectField(field, fieldPath));
  }

  if (objectSpec.labelIdentifierFieldMetadataUniversalIdentifier) {
    if (
      !fieldUniversalIdentifiers.has(
        objectSpec.labelIdentifierFieldMetadataUniversalIdentifier,
      )
    ) {
      errors.push(
        `${objectPath}.labelIdentifierFieldMetadataUniversalIdentifier must reference a field universalIdentifier from the same object`,
      );
    }
  }

  return errors;
};

const validateLogicFunctionSpec = (
  logicFunctionSpec: AppFactoryLogicFunctionSpec,
  functionPath: string,
): string[] => {
  const errors: string[] = [];

  if (
    logicFunctionSpec.timeoutSeconds !== undefined &&
    (!Number.isInteger(logicFunctionSpec.timeoutSeconds) ||
      logicFunctionSpec.timeoutSeconds <= 0)
  ) {
    errors.push(`${functionPath}.timeoutSeconds must be a positive integer`);
  }

  if (logicFunctionSpec.routeTrigger) {
    if (!isNonEmptyString(logicFunctionSpec.routeTrigger.path)) {
      errors.push(`${functionPath}.routeTrigger.path must be a non-empty string`);
    } else if (!logicFunctionSpec.routeTrigger.path.startsWith('/')) {
      errors.push(`${functionPath}.routeTrigger.path must start with '/'`);
    }

    if (
      ![
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
      ].includes(logicFunctionSpec.routeTrigger.httpMethod)
    ) {
      errors.push(
        `${functionPath}.routeTrigger.httpMethod must be GET|POST|PUT|PATCH|DELETE`,
      );
    }

    if (
      logicFunctionSpec.routeTrigger.forwardedRequestHeaders &&
      logicFunctionSpec.routeTrigger.forwardedRequestHeaders.some(
        (header) => !isNonEmptyString(header),
      )
    ) {
      errors.push(
        `${functionPath}.routeTrigger.forwardedRequestHeaders must contain only non-empty strings`,
      );
    }
  }

  return errors;
};

const normalizePostInstall = (
  value: AppFactoryPostInstallExecSpec,
): NormalizedAppFactoryPostInstallExec => ({
  payload: value.payload ?? '{}',
  functionName: value.functionName,
  functionUniversalIdentifier: value.functionUniversalIdentifier,
  preInstall: value.preInstall ?? false,
});

const normalizePipelineOptions = (
  value: AppFactoryPipelineOptionsSpec | undefined,
): NormalizedAppFactoryPipelineOptions => ({
  installDependencies: value?.installDependencies ?? false,
  buildTarball: value?.buildTarball ?? true,
  deploy: value?.deploy ?? false,
  install: value?.install ?? false,
  remote: value?.remote,
  postInstall: value?.postInstall
    ? normalizePostInstall(value.postInstall)
    : undefined,
  dryRun: value?.dryRun ?? false,
});

export const validateAppFactorySpec = (
  input: unknown,
): AppFactoryValidationResult => {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return {
      success: false,
      errors: ['Spec must be an object'],
    };
  }

  const spec = input as Partial<AppFactorySpec>;

  if (!spec.app || !isRecord(spec.app)) {
    errors.push('app must be an object');
  }

  if (!spec.generation || !isRecord(spec.generation)) {
    errors.push('generation must be an object');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const app = spec.app as AppFactorySpec['app'];

  if (!isNonEmptyString(app.directory)) {
    errors.push('app.directory must be a non-empty string');
  }
  if (!isNonEmptyString(app.name)) {
    errors.push('app.name must be a non-empty string');
  }
  if (!isNonEmptyString(app.displayName)) {
    errors.push('app.displayName must be a non-empty string');
  }
  if (!isNonEmptyString(app.description)) {
    errors.push('app.description must be a non-empty string');
  }
  if (app.example !== undefined && !isNonEmptyString(app.example)) {
    errors.push('app.example must be a non-empty string when provided');
  }
  if (isNonEmptyString(app.example)) {
    errors.push(
      'app.example is not supported by app-factory automation; use base template generation to keep execution non-interactive',
    );
  }
  if (
    app.skipLocalInstance !== undefined &&
    !isBoolean(app.skipLocalInstance)
  ) {
    errors.push('app.skipLocalInstance must be a boolean when provided');
  }

  const generation = spec.generation as Partial<AppFactorySpec['generation']>;

  const hasObjectsArray = Array.isArray(generation.objects);
  const hasLogicFunctionsArray = Array.isArray(generation.logicFunctions);

  if (!hasObjectsArray) {
    errors.push('generation.objects must be an array');
  }

  if (!hasLogicFunctionsArray) {
    errors.push('generation.logicFunctions must be an array');
  }

  if (!hasObjectsArray || !hasLogicFunctionsArray) {
    return { success: false, errors };
  }

  const objectSpecs = generation.objects as AppFactoryObjectSpec[];
  const logicFunctionSpecs =
    generation.logicFunctions as AppFactoryLogicFunctionSpec[];

  const objectNames = new Set<string>();
  const objectUniversalIdentifiers = new Set<string>();

  for (const [index, objectSpec] of objectSpecs.entries()) {
    const objectPath = `generation.objects[${index}]`;

    if (!isNonEmptyString(objectSpec.universalIdentifier)) {
      errors.push(`${objectPath}.universalIdentifier must be a non-empty string`);
    }

    if (!isNonEmptyString(objectSpec.nameSingular)) {
      errors.push(`${objectPath}.nameSingular must be a non-empty string`);
    }

    if (!isNonEmptyString(objectSpec.namePlural)) {
      errors.push(`${objectPath}.namePlural must be a non-empty string`);
    }

    if (!isNonEmptyString(objectSpec.labelSingular)) {
      errors.push(`${objectPath}.labelSingular must be a non-empty string`);
    }

    if (!isNonEmptyString(objectSpec.labelPlural)) {
      errors.push(`${objectPath}.labelPlural must be a non-empty string`);
    }

    if (!isNonEmptyString(objectSpec.icon)) {
      errors.push(`${objectPath}.icon must be a non-empty string`);
    }

    if (objectNames.has(objectSpec.nameSingular)) {
      errors.push(`${objectPath}.nameSingular must be unique`);
    }

    if (objectUniversalIdentifiers.has(objectSpec.universalIdentifier)) {
      errors.push(`${objectPath}.universalIdentifier must be unique`);
    }

    objectNames.add(objectSpec.nameSingular);
    objectUniversalIdentifiers.add(objectSpec.universalIdentifier);

    errors.push(...validateObjectSpec(objectSpec, objectPath));
  }

  const logicFunctionNames = new Set<string>();
  const logicFunctionUniversalIdentifiers = new Set<string>();

  for (const [index, logicFunctionSpec] of logicFunctionSpecs.entries()) {
    const functionPath = `generation.logicFunctions[${index}]`;

    if (!isNonEmptyString(logicFunctionSpec.universalIdentifier)) {
      errors.push(
        `${functionPath}.universalIdentifier must be a non-empty string`,
      );
    }

    if (!isNonEmptyString(logicFunctionSpec.name)) {
      errors.push(`${functionPath}.name must be a non-empty string`);
    }

    if (!isNonEmptyString(logicFunctionSpec.description)) {
      errors.push(`${functionPath}.description must be a non-empty string`);
    }

    if (logicFunctionNames.has(logicFunctionSpec.name)) {
      errors.push(`${functionPath}.name must be unique`);
    }

    if (
      logicFunctionUniversalIdentifiers.has(logicFunctionSpec.universalIdentifier)
    ) {
      errors.push(`${functionPath}.universalIdentifier must be unique`);
    }

    logicFunctionNames.add(logicFunctionSpec.name);
    logicFunctionUniversalIdentifiers.add(logicFunctionSpec.universalIdentifier);

    errors.push(...validateLogicFunctionSpec(logicFunctionSpec, functionPath));
  }

  if (spec.pipeline !== undefined && !isRecord(spec.pipeline)) {
    errors.push('pipeline must be an object when provided');
  }

  if (isRecord(spec.pipeline)) {
    const pipeline = spec.pipeline as AppFactoryPipelineOptionsSpec;

    if (
      pipeline.installDependencies !== undefined &&
      !isBoolean(pipeline.installDependencies)
    ) {
      errors.push('pipeline.installDependencies must be a boolean when provided');
    }

    if (pipeline.buildTarball !== undefined && !isBoolean(pipeline.buildTarball)) {
      errors.push('pipeline.buildTarball must be a boolean when provided');
    }

    if (pipeline.deploy !== undefined && !isBoolean(pipeline.deploy)) {
      errors.push('pipeline.deploy must be a boolean when provided');
    }

    if (pipeline.install !== undefined && !isBoolean(pipeline.install)) {
      errors.push('pipeline.install must be a boolean when provided');
    }

    if (pipeline.dryRun !== undefined && !isBoolean(pipeline.dryRun)) {
      errors.push('pipeline.dryRun must be a boolean when provided');
    }

    if (pipeline.remote !== undefined && !isNonEmptyString(pipeline.remote)) {
      errors.push('pipeline.remote must be a non-empty string when provided');
    }

    if (pipeline.postInstall !== undefined) {
      if (!isRecord(pipeline.postInstall)) {
        errors.push('pipeline.postInstall must be an object when provided');
      } else {
        const postInstall = pipeline.postInstall as AppFactoryPostInstallExecSpec;
        if (postInstall.payload !== undefined && !isNonEmptyString(postInstall.payload)) {
          errors.push(
            'pipeline.postInstall.payload must be a non-empty JSON string when provided',
          );
        }
        if (
          postInstall.functionName !== undefined &&
          !isNonEmptyString(postInstall.functionName)
        ) {
          errors.push(
            'pipeline.postInstall.functionName must be a non-empty string when provided',
          );
        }
        if (
          postInstall.functionUniversalIdentifier !== undefined &&
          !isNonEmptyString(postInstall.functionUniversalIdentifier)
        ) {
          errors.push(
            'pipeline.postInstall.functionUniversalIdentifier must be a non-empty string when provided',
          );
        }
        if (postInstall.preInstall !== undefined && !isBoolean(postInstall.preInstall)) {
          errors.push(
            'pipeline.postInstall.preInstall must be a boolean when provided',
          );
        }

        if (
          !postInstall.preInstall &&
          !postInstall.functionName &&
          !postInstall.functionUniversalIdentifier
        ) {
          errors.push(
            'pipeline.postInstall must provide functionName or functionUniversalIdentifier unless preInstall is true',
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const normalizedSpec: NormalizedAppFactorySpec = {
    app: {
      directory: app.directory,
      name: app.name,
      displayName: app.displayName,
      description: app.description,
      example: app.example,
      skipLocalInstance: app.skipLocalInstance ?? true,
    },
    generation: {
      objects: objectSpecs,
      logicFunctions: logicFunctionSpecs,
    },
    pipeline: normalizePipelineOptions(spec.pipeline),
  };

  return {
    success: true,
    spec: normalizedSpec,
  };
};
