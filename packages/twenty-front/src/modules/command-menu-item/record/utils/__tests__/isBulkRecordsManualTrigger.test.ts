import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { isBulkRecordsManualTrigger } from '@/command-menu-item/record/utils/isBulkRecordsManualTrigger';

describe('isBulkRecordsManualTrigger', () => {
  it('should return true for a MANUAL trigger with BULK_RECORDS availability', () => {
    const trigger: WorkflowTrigger = {
      type: 'MANUAL',
      settings: {
        outputSchema: {},
        availability: {
          type: 'BULK_RECORDS',
          objectNameSingular: 'person',
        },
      },
    };

    expect(isBulkRecordsManualTrigger(trigger)).toBe(true);
  });

  it('should return false for a MANUAL trigger with SINGLE_RECORD availability', () => {
    const trigger: WorkflowTrigger = {
      type: 'MANUAL',
      settings: {
        outputSchema: {},
        availability: {
          type: 'SINGLE_RECORD',
          objectNameSingular: 'person',
        },
      },
    };

    expect(isBulkRecordsManualTrigger(trigger)).toBe(false);
  });

  it('should return false for a MANUAL trigger with GLOBAL availability', () => {
    const trigger: WorkflowTrigger = {
      type: 'MANUAL',
      settings: {
        outputSchema: {},
        availability: {
          type: 'GLOBAL',
        },
      },
    };

    expect(isBulkRecordsManualTrigger(trigger)).toBe(false);
  });

  it('should return false for a MANUAL trigger with no availability', () => {
    const trigger: WorkflowTrigger = {
      type: 'MANUAL',
      settings: {
        outputSchema: {},
      },
    };

    expect(isBulkRecordsManualTrigger(trigger)).toBe(false);
  });

  it('should return false for a non-MANUAL trigger', () => {
    const trigger: WorkflowTrigger = {
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };

    expect(isBulkRecordsManualTrigger(trigger)).toBe(false);
  });
});
