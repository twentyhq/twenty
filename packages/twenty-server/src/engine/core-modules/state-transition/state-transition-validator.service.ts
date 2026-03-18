import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  type FieldCondition,
  type StateTransitionConfig,
} from 'src/engine/core-modules/state-transition/types/state-transition-config.type';

type RecordRow = Record<string, unknown>;

@Injectable()
export class StateTransitionValidatorService {
  validate(
    config: StateTransitionConfig,
    currentRecord: RecordRow,
    targetStage: string,
  ): void {
    const failures: string[] = [];

    for (const rule of config.rules) {
      if (!rule.toStages.includes(targetStage)) {
        continue;
      }

      const currentStage = currentRecord[config.stageFieldName] as
        | string
        | undefined;

      if (
        rule.fromStages !== undefined &&
        (currentStage === undefined || !rule.fromStages.includes(currentStage))
      ) {
        continue;
      }

      for (const field of rule.fields) {
        const value = currentRecord[field.name];

        if (!this.evaluateCondition(field.condition, value, currentRecord)) {
          failures.push(
            field.message ??
              `Field "${field.name}" is required before advancing to "${targetStage}".`,
          );
        }
      }
    }

    if (failures.length > 0) {
      const detail = failures.join(' ');

      throw new CommonQueryRunnerException(
        `State transition to "${targetStage}" blocked for ${config.objectName}: ${detail}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`One or more required fields must be filled before advancing to this stage.`,
        },
      );
    }
  }

  private evaluateCondition(
    condition: FieldCondition,
    value: unknown,
    currentRecord: RecordRow,
  ): boolean {
    switch (condition.type) {
      case 'nonEmpty':
        return value !== null && value !== undefined && value !== '';
      case 'oneOf':
        return typeof value === 'string' && condition.values.includes(value);
      case 'notOneOf':
        return typeof value === 'string' && !condition.values.includes(value);
      case 'minValue':
        return typeof value === 'number' && value >= condition.value;
      case 'relatedRecordExists':
        return (
          currentRecord[condition.via] !== null &&
          currentRecord[condition.via] !== undefined
        );
    }
  }
}
