import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Section } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsValidationRuleCard } from '@/validation-rules/components/SettingsValidationRuleCard';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';

const StyledRuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

type ObjectValidationRulesProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectValidationRules = ({
  objectMetadataItem,
}: ObjectValidationRulesProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { validationRules, refetchValidationRules } = useValidationRules({
    objectMetadataId: objectMetadataItem.id,
  });
  const [isAddingRule, setIsAddingRule] = useState(false);

  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataItem,
    objectMetadataItems,
  });

  const handleRuleSaved = async () => {
    setIsAddingRule(false);
    await refetchValidationRules();
  };

  const handleRuleDeleted = async () => {
    setIsAddingRule(false);
    await refetchValidationRules();
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Validation rules`}
        description={t`A record saves only when every active rule is true. Rules run on every write: forms, API, imports and workflows.`}
      />
      <StyledRuleList>
        {validationRules.map((validationRule) => (
          <SettingsValidationRuleCard
            key={validationRule.id}
            objectMetadataItem={objectMetadataItem}
            fields={fields}
            validationRule={validationRule}
            onSaved={handleRuleSaved}
            onDeleted={handleRuleDeleted}
          />
        ))}
        {isAddingRule && (
          <SettingsValidationRuleCard
            objectMetadataItem={objectMetadataItem}
            fields={fields}
            onSaved={handleRuleSaved}
            onDeleted={handleRuleDeleted}
          />
        )}
        {!isAddingRule && (
          <div>
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconPlus />}
              onClick={() => setIsAddingRule(true)}
            >{t`Add rule`}</Button>
          </div>
        )}
      </StyledRuleList>
    </Section.Root>
  );
};
