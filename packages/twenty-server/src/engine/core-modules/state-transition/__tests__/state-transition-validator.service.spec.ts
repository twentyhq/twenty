import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { StateTransitionValidatorService } from 'src/engine/core-modules/state-transition/state-transition-validator.service';
import { type StateTransitionConfig } from 'src/engine/core-modules/state-transition/types/state-transition-config.type';

const SIMPLE_CONFIG: StateTransitionConfig = {
  objectName: 'opportunity',
  stageFieldName: 'stage',
  rules: [
    {
      toStages: ['QUOTE_REQUESTED', 'PROPOSAL_SUBMITTED', 'CLOSED_WON'],
      fields: [
        {
          name: 'companyId',
          condition: { type: 'nonEmpty' },
          message: 'A Client Account must be linked before advancing to this stage.',
        },
      ],
    },
  ],
};

describe('StateTransitionValidatorService', () => {
  let service: StateTransitionValidatorService;

  beforeEach(() => {
    service = new StateTransitionValidatorService();
  });

  // ── No-op cases ────────────────────────────────────────────────────────────

  it('should not throw when target stage matches no rules', () => {
    expect(() =>
      service.validate(SIMPLE_CONFIG, { stage: 'NEW', companyId: null }, 'LEAD'),
    ).not.toThrow();
  });

  it('should not throw when all conditions pass', () => {
    expect(() =>
      service.validate(
        SIMPLE_CONFIG,
        { stage: 'LEAD', companyId: 'some-uuid' },
        'QUOTE_REQUESTED',
      ),
    ).not.toThrow();
  });

  it('should not throw for CLOSED_LOST regardless of companyId', () => {
    expect(() =>
      service.validate(
        SIMPLE_CONFIG,
        { stage: 'LEAD', companyId: null },
        'CLOSED_LOST',
      ),
    ).not.toThrow();
  });

  // ── nonEmpty condition ──────────────────────────────────────────────────────

  it('should throw when nonEmpty condition fails because field is null', () => {
    expect(() =>
      service.validate(
        SIMPLE_CONFIG,
        { stage: 'LEAD', companyId: null },
        'QUOTE_REQUESTED',
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should throw when nonEmpty condition fails because field is undefined', () => {
    expect(() =>
      service.validate(SIMPLE_CONFIG, { stage: 'LEAD' }, 'QUOTE_REQUESTED'),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should throw when nonEmpty condition fails because field is empty string', () => {
    expect(() =>
      service.validate(
        SIMPLE_CONFIG,
        { stage: 'LEAD', companyId: '' },
        'QUOTE_REQUESTED',
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  // ── Exception properties ────────────────────────────────────────────────────

  it('should throw CommonQueryRunnerException with INVALID_ARGS_DATA code', () => {
    try {
      service.validate(
        SIMPLE_CONFIG,
        { stage: 'LEAD', companyId: null },
        'QUOTE_REQUESTED',
      );
      fail('Expected exception was not thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(CommonQueryRunnerException);
      expect((error as CommonQueryRunnerException).code).toBe(
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      );
    }
  });

  it('should use field-level message override in the exception message', () => {
    try {
      service.validate(
        SIMPLE_CONFIG,
        { stage: 'LEAD', companyId: null },
        'QUOTE_REQUESTED',
      );
      fail('Expected exception was not thrown');
    } catch (error) {
      expect((error as CommonQueryRunnerException).message).toContain(
        'A Client Account must be linked before advancing to this stage.',
      );
    }
  });

  it('should use a default message when no field-level message is set', () => {
    const config: StateTransitionConfig = {
      objectName: 'opportunity',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['CLOSED_WON'],
          fields: [{ name: 'closeDate', condition: { type: 'nonEmpty' } }],
        },
      ],
    };

    try {
      service.validate(config, { stage: 'PROPOSAL_SUBMITTED', closeDate: null }, 'CLOSED_WON');
      fail('Expected exception was not thrown');
    } catch (error) {
      expect((error as CommonQueryRunnerException).message).toContain(
        'Field "closeDate" is required before advancing to "CLOSED_WON".',
      );
    }
  });

  // ── oneOf condition ─────────────────────────────────────────────────────────

  it('should not throw when oneOf condition passes', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'priority',
              condition: { type: 'oneOf', values: ['HIGH', 'CRITICAL'] },
              message: 'Priority must be HIGH or CRITICAL.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', priority: 'HIGH' }, 'NEXT'),
    ).not.toThrow();
  });

  it('should throw when oneOf condition fails', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'priority',
              condition: { type: 'oneOf', values: ['HIGH', 'CRITICAL'] },
              message: 'Priority must be HIGH or CRITICAL.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', priority: 'LOW' }, 'NEXT'),
    ).toThrow(CommonQueryRunnerException);
  });

  // ── notOneOf condition ──────────────────────────────────────────────────────

  it('should not throw when notOneOf condition passes', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'status',
              condition: { type: 'notOneOf', values: ['BLOCKED', 'CANCELLED'] },
              message: 'Status must not be BLOCKED or CANCELLED.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', status: 'ACTIVE' }, 'NEXT'),
    ).not.toThrow();
  });

  it('should throw when notOneOf condition fails', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'status',
              condition: { type: 'notOneOf', values: ['BLOCKED', 'CANCELLED'] },
              message: 'Status must not be BLOCKED or CANCELLED.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', status: 'BLOCKED' }, 'NEXT'),
    ).toThrow(CommonQueryRunnerException);
  });

  // ── minValue condition ──────────────────────────────────────────────────────

  it('should not throw when minValue condition passes', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'amount',
              condition: { type: 'minValue', value: 100 },
              message: 'Amount must be at least 100.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', amount: 500 }, 'NEXT'),
    ).not.toThrow();
  });

  it('should throw when minValue condition fails', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'amount',
              condition: { type: 'minValue', value: 100 },
              message: 'Amount must be at least 100.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', amount: 50 }, 'NEXT'),
    ).toThrow(CommonQueryRunnerException);
  });

  // ── relatedRecordExists condition ───────────────────────────────────────────

  it('should not throw when relatedRecordExists condition passes', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'ownerId',
              condition: { type: 'relatedRecordExists', via: 'ownerId' },
              message: 'An owner must be assigned.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', ownerId: 'some-uuid' }, 'NEXT'),
    ).not.toThrow();
  });

  it('should throw when relatedRecordExists condition fails because FK is null', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'ownerId',
              condition: { type: 'relatedRecordExists', via: 'ownerId' },
              message: 'An owner must be assigned.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(config, { stage: 'START', ownerId: null }, 'NEXT'),
    ).toThrow(CommonQueryRunnerException);
  });

  // ── fromStages filter ───────────────────────────────────────────────────────

  it('should skip rule when current stage is not in fromStages', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fromStages: ['SPECIFIC_STAGE'],
          fields: [
            {
              name: 'companyId',
              condition: { type: 'nonEmpty' },
              message: 'Company required.',
            },
          ],
        },
      ],
    };

    // current stage is 'OTHER_STAGE', not in fromStages — rule should not apply
    expect(() =>
      service.validate(config, { stage: 'OTHER_STAGE', companyId: null }, 'NEXT'),
    ).not.toThrow();
  });

  it('should apply rule when current stage matches fromStages', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fromStages: ['SPECIFIC_STAGE'],
          fields: [
            {
              name: 'companyId',
              condition: { type: 'nonEmpty' },
              message: 'Company required.',
            },
          ],
        },
      ],
    };

    expect(() =>
      service.validate(
        config,
        { stage: 'SPECIFIC_STAGE', companyId: null },
        'NEXT',
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  // ── Multiple failures ───────────────────────────────────────────────────────

  it('should collect all failures from a single rule with multiple fields', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'companyId',
              condition: { type: 'nonEmpty' },
              message: 'Company is required.',
            },
            {
              name: 'closeDate',
              condition: { type: 'nonEmpty' },
              message: 'Close date is required.',
            },
          ],
        },
      ],
    };

    try {
      service.validate(
        config,
        { stage: 'START', companyId: null, closeDate: null },
        'NEXT',
      );
      fail('Expected exception was not thrown');
    } catch (error) {
      expect((error as CommonQueryRunnerException).message).toContain(
        'Company is required.',
      );
      expect((error as CommonQueryRunnerException).message).toContain(
        'Close date is required.',
      );
    }
  });

  it('should collect failures from multiple matching rules', () => {
    const config: StateTransitionConfig = {
      objectName: 'test',
      stageFieldName: 'stage',
      rules: [
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'companyId',
              condition: { type: 'nonEmpty' },
              message: 'Company is required.',
            },
          ],
        },
        {
          toStages: ['NEXT'],
          fields: [
            {
              name: 'closeDate',
              condition: { type: 'nonEmpty' },
              message: 'Close date is required.',
            },
          ],
        },
      ],
    };

    try {
      service.validate(
        config,
        { stage: 'START', companyId: null, closeDate: null },
        'NEXT',
      );
      fail('Expected exception was not thrown');
    } catch (error) {
      expect((error as CommonQueryRunnerException).message).toContain(
        'Company is required.',
      );
      expect((error as CommonQueryRunnerException).message).toContain(
        'Close date is required.',
      );
    }
  });
});
