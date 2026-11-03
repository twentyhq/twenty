import { Logger } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { type UniversalConditionalDisplay } from 'twenty-shared/types';
import {
  compileConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type FindObjectFieldByName } from 'src/engine/core-modules/application/application-manifest/types/find-object-field-by-name.type';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';
import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';

export const resolveLegacyConditionalDisplayOrThrow = ({
  loggerContext,
  entityLabel,
  legacyPropertyName,
  legacyConditionalDisplay,
  conditionalDisplay,
  objectUniversalIdentifier,
  findObjectFieldByName,
}: {
  loggerContext: string;
  entityLabel: string;
  legacyPropertyName: string;
  legacyConditionalDisplay: string | Record<string, unknown> | undefined;
  conditionalDisplay?: UniversalConditionalDisplay;
  objectUniversalIdentifier?: string;
  findObjectFieldByName?: FindObjectFieldByName;
}): UniversalConditionalDisplay | undefined => {
  if (isDefined(conditionalDisplay) || !isDefined(legacyConditionalDisplay)) {
    return conditionalDisplay;
  }

  const fieldMetadataUniversalIdentifierById: Record<string, string> = {};

  let resolvedConditionalDisplay: UniversalConditionalDisplay | null;

  try {
    resolvedConditionalDisplay = isString(legacyConditionalDisplay)
      ? compileConditionalAvailabilityExpression(legacyConditionalDisplay)
      : fromConditionalDisplayToUniversalConditionalDisplay({
          conditionalDisplay: compileLegacyWidgetJsonLogic({
            jsonLogic: legacyConditionalDisplay,
            resolveField: (fieldName) => {
              const field = isDefined(objectUniversalIdentifier)
                ? findObjectFieldByName?.({
                    objectUniversalIdentifier,
                    fieldName,
                  })
                : undefined;

              if (!isDefined(field)) {
                return undefined;
              }

              fieldMetadataUniversalIdentifierById[field.universalIdentifier] =
                field.universalIdentifier;

              return {
                fieldMetadataId: field.universalIdentifier,
                type: field.type,
              };
            },
          }),
          fieldMetadataUniversalIdentifierById,
          roleUniversalIdentifierById: {},
        });
  } catch (error) {
    throw new ApplicationException(
      `${entityLabel} carries a ${legacyPropertyName} that cannot be converted: ${error instanceof Error ? error.message : String(error)}. Rebuild the app with the current SDK.`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  new Logger(loggerContext).warn(
    `${entityLabel} carries a ${legacyPropertyName}: Built with an older SDK. Rebuild to remove this warning.`,
  );

  return resolvedConditionalDisplay ?? undefined;
};
