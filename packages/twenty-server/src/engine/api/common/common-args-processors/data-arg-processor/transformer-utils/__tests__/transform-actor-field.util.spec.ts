import { FieldActorSource } from 'twenty-shared/types';

import { transformActorField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-actor-field.util';

describe('transformActorField', () => {
  it('should return null when value is null', () => {
    const result = transformActorField(null);

    expect(result).toBeNull();
  });

  it('should transform actor with source only', () => {
    const result = transformActorField({
      source: FieldActorSource.EMAIL,
    });

    expect(result).toEqual({
      source: FieldActorSource.EMAIL,
    });
  });

  it('should transform actor with source and context', () => {
    const result = transformActorField({
      source: FieldActorSource.WORKFLOW,
      context: { workflowId: '123', stepId: 'step-1' },
    });

    expect(result).toEqual({
      source: FieldActorSource.WORKFLOW,
      context: { workflowId: '123', stepId: 'step-1' },
    });
  });

  it('should transform actor with null source', () => {
    const result = transformActorField({
      source: null,
      context: { userId: '456' },
    });

    expect(result).toEqual({
      source: null,
      context: { userId: '456' },
    });
  });

  it('should transform actor with null context', () => {
    const result = transformActorField({
      source: FieldActorSource.API,
      context: null,
    });

    expect(result).toEqual({
      source: FieldActorSource.API,
      context: null,
    });
  });

  it('should transform empty context object to null', () => {
    const result = transformActorField({
      source: FieldActorSource.EMAIL,
      context: {},
    });

    expect(result).toEqual({
      source: FieldActorSource.EMAIL,
      context: null,
    });
  });
});
