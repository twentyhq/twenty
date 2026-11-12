import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

type RuleLinkedEntity = {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  rowLevelPermissionRuleUniversalIdentifier: string | null;
};

export const assertRowLevelPermissionRuleLinksOrThrow = ({
  declaredRules,
  ruleLinkedEntities,
}: {
  declaredRules: Pick<
    RuleLinkedEntity,
    'universalIdentifier' | 'objectMetadataUniversalIdentifier'
  >[];
  ruleLinkedEntities: RuleLinkedEntity[];
}): void => {
  const objectUniversalIdentifierByRuleUniversalIdentifier = new Map(
    declaredRules.map((rule) => [
      rule.universalIdentifier,
      rule.objectMetadataUniversalIdentifier,
    ]),
  );

  for (const ruleLinkedEntity of ruleLinkedEntities) {
    const ruleUniversalIdentifier =
      ruleLinkedEntity.rowLevelPermissionRuleUniversalIdentifier;

    if (!isDefined(ruleUniversalIdentifier)) {
      continue;
    }

    const ruleObjectUniversalIdentifier =
      objectUniversalIdentifierByRuleUniversalIdentifier.get(
        ruleUniversalIdentifier,
      );

    if (!isDefined(ruleObjectUniversalIdentifier)) {
      throw new ApplicationException(
        `Row level permission predicate or group ${ruleLinkedEntity.universalIdentifier} references rule ${ruleUniversalIdentifier}, which its role does not declare`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`A row level permission predicate references a rule its role does not declare.`,
        },
      );
    }

    if (
      ruleObjectUniversalIdentifier !==
      ruleLinkedEntity.objectMetadataUniversalIdentifier
    ) {
      throw new ApplicationException(
        `Row level permission predicate or group ${ruleLinkedEntity.universalIdentifier} and its rule ${ruleUniversalIdentifier} are not on the same object`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`A row level permission predicate and its rule must be on the same object.`,
        },
      );
    }
  }
};
