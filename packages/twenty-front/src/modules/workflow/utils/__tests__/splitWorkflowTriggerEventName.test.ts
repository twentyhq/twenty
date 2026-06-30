import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';

describe('splitWorkflowTriggerEventName', () => {
  it('should split a basic event name into objectType and event', () => {
    const eventName = 'company.created';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'company',
      event: 'created',
    });
  });

  it('should split event name with updated event', () => {
    const eventName = 'person.updated';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'person',
      event: 'updated',
    });
  });

  it('should split event name with deleted event', () => {
    const eventName = 'opportunity.deleted';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'opportunity',
      event: 'deleted',
    });
  });

  it('should handle camelCase object types', () => {
    const eventName = 'activityTarget.created';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'activityTarget',
      event: 'created',
    });
  });

  it('should handle event names with underscores', () => {
    const eventName = 'custom_object.field_updated';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'custom_object',
      event: 'field_updated',
    });
  });

  it('should handle event names without dots', () => {
    const eventName = 'invalidEventName';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'invalidEventName',
      event: undefined,
    });
  });

  it('should handle empty string', () => {
    const eventName = '';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: '',
      event: undefined,
    });
  });

  it('should handle event name starting with dot', () => {
    const eventName = '.created';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: '',
      event: 'created',
    });
  });

  it('should handle event name ending with dot', () => {
    const eventName = 'company.';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'company',
      event: '',
    });
  });

  it('should split event name with upserted event', () => {
    const eventName = 'company.upserted';

    const result = splitWorkflowTriggerEventName(eventName);

    expect(result).toEqual({
      objectType: 'company',
      event: 'upserted',
    });
  });
});
