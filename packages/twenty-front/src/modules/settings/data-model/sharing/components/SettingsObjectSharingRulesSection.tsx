import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsObjectSharingRuleForm } from '@/settings/data-model/sharing/components/SettingsObjectSharingRuleForm';
import { SettingsObjectSharingRuleRow } from '@/settings/data-model/sharing/components/SettingsObjectSharingRuleRow';
import { useSharingRules } from '@/settings/data-model/sharing/hooks/useSharingRules';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEmptyState = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

type SettingsObjectSharingRulesSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  hasOrganizationPlan: boolean;
  isReadOnly: boolean;
};

export const SettingsObjectSharingRulesSection = ({
  objectMetadataItem,
  hasOrganizationPlan,
  isReadOnly,
}: SettingsObjectSharingRulesSectionProps) => {
  const { t } = useLingui();
  const { sharingRules, loading } = useSharingRules(objectMetadataItem.id);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <StyledContainer>
      {sharingRules.map((sharingRule) => (
        <SettingsObjectSharingRuleRow
          key={sharingRule.id}
          sharingRule={sharingRule}
          objectMetadataItem={objectMetadataItem}
          hasOrganizationPlan={hasOrganizationPlan}
          isReadOnly={isReadOnly}
        />
      ))}
      {!loading && sharingRules.length === 0 && (
        <StyledEmptyState>{t`No sharing rule yet`}</StyledEmptyState>
      )}
      {isCreating ? (
        <SettingsObjectSharingRuleForm
          objectMetadataId={objectMetadataItem.id}
          onCreated={() => setIsCreating(false)}
        />
      ) : (
        !isReadOnly && (
          <div>
            <Button
              Icon={IconPlus}
              title={t`New rule`}
              size="small"
              onClick={() => setIsCreating(true)}
            />
          </div>
        )
      )}
    </StyledContainer>
  );
};
