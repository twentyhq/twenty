import { Injectable } from '@nestjs/common';

import { Parser, type EvaluationContext } from 'expr-eval-fork';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

type CalculatedFieldSettings = {
  calculation?:
    | {
        expression?: string | null;
        formula?: string | null;
        dependencies?: string[] | null;
      }
    | null;
  expression?: string | null;
  formula?: string | null;
};

export type CalculatedFieldPreview = {
  expression: string;
  value: unknown;
  context: EvaluationContext;
  dependencies: string[];
};

@Injectable()
export class CalculatedFieldService {
  private readonly parser = new Parser();

  constructor() {
    this.registerFunctions();
  }

  previewFieldValue({
    fieldMetadata,
    record,
    context = {},
  }: {
    fieldMetadata: Pick<FieldMetadataEntity, 'name' | 'settings'>;
    record: Record<string, unknown>;
    context?: Record<string, unknown>;
  }): CalculatedFieldPreview {
    const calculatedFieldSettings =
      fieldMetadata.settings as CalculatedFieldSettings | null | undefined;
    const calculation = calculatedFieldSettings?.calculation;
    const expression =
      calculation?.expression ??
      calculation?.formula ??
      calculatedFieldSettings?.expression ??
      calculatedFieldSettings?.formula ??
      null;

    if (!isNonEmptyString(expression)) {
      throw new FieldMetadataException(
        `Field "${fieldMetadata.name}" does not define a calculation expression`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    const evaluationContext = this.buildEvaluationContext(record, context);

    try {
      const parsed = this.parser.parse(expression);

      return {
        expression,
        value: parsed.evaluate(evaluationContext),
        context: evaluationContext,
        dependencies: calculation?.dependencies ?? [],
      };
    } catch (error) {
      throw new FieldMetadataException(
        `Failed to evaluate calculation for field "${fieldMetadata.name}": ${error instanceof Error ? error.message : String(error)}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }

  hasCalculation(fieldMetadata: Pick<FieldMetadataEntity, 'settings'>): boolean {
    return this.getExpression(fieldMetadata) !== null;
  }

  getExpression(
    fieldMetadata: Pick<FieldMetadataEntity, 'settings'>,
  ): string | null {
    const calculatedFieldSettings =
      fieldMetadata.settings as CalculatedFieldSettings | null | undefined;

    return (
      calculatedFieldSettings?.calculation?.expression ??
      calculatedFieldSettings?.calculation?.formula ??
      calculatedFieldSettings?.expression ??
      calculatedFieldSettings?.formula ??
      null
    );
  }

  private buildEvaluationContext(
    record: Record<string, unknown>,
    context: Record<string, unknown>,
  ): EvaluationContext {
    return {
      ...record,
      ...context,
    } as EvaluationContext;
  }

  private registerFunctions(): void {
    this.parser.functions.coalesce = (...values: unknown[]) =>
      values.find((value) => isDefined(value)) ?? null;

    this.parser.functions.if = (
      condition: unknown,
      whenTrue: unknown,
      whenFalse: unknown,
    ) => (condition ? whenTrue : whenFalse);

    this.parser.functions.round = (value: unknown, decimals = 0) => {
      if (!isDefined(value)) {
        return null;
      }

      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        return null;
      }

      const factor = 10 ** Number(decimals ?? 0);

      return Math.round(numericValue * factor) / factor;
    };

    this.parser.functions.min = (...values: unknown[]) => {
      const numericValues = values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      if (numericValues.length === 0) {
        return null;
      }

      return Math.min(...numericValues);
    };

    this.parser.functions.max = (...values: unknown[]) => {
      const numericValues = values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      if (numericValues.length === 0) {
        return null;
      }

      return Math.max(...numericValues);
    };

    this.parser.functions.sum = (...values: unknown[]) => {
      const numericValues = values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      return numericValues.reduce((accumulator, value) => accumulator + value, 0);
    };

    this.parser.functions.avg = (...values: unknown[]) => {
      const numericValues = values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      if (numericValues.length === 0) {
        return null;
      }

      return (
        numericValues.reduce((accumulator, value) => accumulator + value, 0) /
        numericValues.length
      );
    };

    this.parser.functions.concat = (...values: unknown[]) =>
      values
        .filter((value) => isDefined(value))
        .map((value) => String(value))
        .join('');

    this.parser.functions.lower = (value: unknown) =>
      isDefined(value) ? String(value).toLowerCase() : null;

    this.parser.functions.upper = (value: unknown) =>
      isDefined(value) ? String(value).toUpperCase() : null;

    this.parser.functions.trim = (value: unknown) =>
      isDefined(value) ? String(value).trim() : null;
  }
}
