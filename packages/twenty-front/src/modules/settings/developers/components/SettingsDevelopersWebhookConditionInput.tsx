import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type WebhookOperationType } from '@/settings/developers/types/WebhookOperationsType';
import { getWebhookConditionObjectNameSingular } from '@/settings/developers/utils/getWebhookConditionObjectNameSingular';
import { RecordEventConditionEditor } from '@/validation-rules/components/RecordEventConditionEditor';
import { ValidationRuleExpressionText } from '@/validation-rules/components/ValidationRuleExpressionText';

// The event rows above already end with a spacing[2] margin
const StyledContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledHintContainer = styled(StyledContainer)`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type SettingsDevelopersWebhookConditionInputProps = {
  operations: WebhookOperationType[];
  condition: string;
  onConditionChange: (condition: string) => void;
};

export const SettingsDevelopersWebhookConditionInput = ({
  operations,
  condition,
  onConditionChange,
}: SettingsDevelopersWebhookConditionInputProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const objectNameSingular = getWebhookConditionObjectNameSingular(operations);
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.isActive && item.nameSingular === objectNameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    return (
      <StyledHintContainer>
        {isNonEmptyString(condition) && (
          <ValidationRuleExpressionText expression={condition} />
        )}
        <StyledHint>{t`Select events of a single object to add a condition.`}</StyledHint>
      </StyledHintContainer>
    );
  }

  return (
    <Field.Root render={<StyledContainer />}>
      <Field.Label>{t`Condition (Optional)`}</Field.Label>
      <RecordEventConditionEditor
        key={objectMetadataItem.nameSingular}
        objectMetadataItem={objectMetadataItem}
        condition={condition}
        onConditionChange={onConditionChange}
        isReadOnly={false}
      />
    </Field.Root>
  );
};
