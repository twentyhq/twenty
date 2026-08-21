import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsObjectTimelineRulesTable } from '@/settings/data-model/timeline-rules/components/SettingsObjectTimelineRulesTable';
import { useFindManyTimelineActivityRules } from '@/settings/data-model/timeline-rules/hooks/useFindManyTimelineActivityRules';
import { useResetTimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useResetTimelineActivityRule';
import { useUpsertTimelineActivityRule } from '@/settings/data-model/timeline-rules/hooks/useUpsertTimelineActivityRule';
import { getSettingsTimelineRuleCandidateRelations } from '@/settings/data-model/timeline-rules/utils/getSettingsTimelineRuleCandidateRelations';
import {
  getSettingsTimelineRuleRows,
  type SettingsTimelineRuleRow,
} from '@/settings/data-model/timeline-rules/utils/getSettingsTimelineRuleRows';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconPlus, IconTimelineEvent } from 'twenty-ui/icon';
import { Button, SearchInput } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsObjectTimelineSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

export const SettingsObjectTimelineSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectTimelineSectionProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { objectMetadataItems } = useObjectMetadataItems();

  const { timelineActivityRules } = useFindManyTimelineActivityRules();
  const { upsertTimelineActivityRule } = useUpsertTimelineActivityRule();
  const { resetTimelineActivityRule } = useResetTimelineActivityRule();

  const [searchTerm, setSearchTerm] = useState('');

  const selfTimelineActivityRule = timelineActivityRules.find(
    (rule) =>
      rule.objectMetadataId === objectMetadataItem.id &&
      !isDefined(rule.relationFieldMetadataId),
  );

  const timelineRuleRows = useMemo(
    () =>
      getSettingsTimelineRuleRows({
        timelineActivityRules,
        objectMetadataItem,
        objectMetadataItems,
      }),
    [timelineActivityRules, objectMetadataItem, objectMetadataItems],
  );

  const candidateRelations = useMemo(
    () =>
      getSettingsTimelineRuleCandidateRelations({
        timelineActivityRules,
        objectMetadataItem,
        objectMetadataItems,
      }),
    [timelineActivityRules, objectMetadataItem, objectMetadataItems],
  );

  const searchNormalized = normalizeSearchText(searchTerm);
  const filteredTimelineRuleRows =
    searchNormalized.length === 0
      ? timelineRuleRows
      : timelineRuleRows.filter((row) =>
          normalizeSearchText(
            `${row.sourceObjectMetadataItem.labelPlural} ${row.viaFieldMetadataItem?.label ?? ''}`,
          ).includes(searchNormalized),
        );

  const handleEdit = (row: SettingsTimelineRuleRow) => {
    if (!isDefined(row.viaFieldMetadataItem)) {
      return;
    }

    navigate(SettingsPath.ObjectTimelineRuleEdit, {
      objectNamePlural: objectMetadataItem.namePlural,
      relationFieldMetadataId: row.viaFieldMetadataItem.id,
    });
  };

  const handleToggleActive = async (row: SettingsTimelineRuleRow) => {
    if (!isDefined(row.timelineActivityRule)) {
      return;
    }

    await upsertTimelineActivityRule({
      objectMetadataId: row.timelineActivityRule.objectMetadataId,
      relationFieldMetadataId: row.timelineActivityRule.relationFieldMetadataId,
      isActive: !row.timelineActivityRule.isActive,
    });
  };

  const handleReset = async (row: SettingsTimelineRuleRow) => {
    if (!isDefined(row.timelineActivityRule)) {
      return;
    }

    await resetTimelineActivityRule({
      objectMetadataId: row.timelineActivityRule.objectMetadataId,
      relationFieldMetadataId: row.timelineActivityRule.relationFieldMetadataId,
    });
  };

  const handleToggleSelfRule = async (checked: boolean) => {
    await upsertTimelineActivityRule({
      objectMetadataId: objectMetadataItem.id,
      isActive: checked,
    });
  };

  const objectLabelSingular = objectMetadataItem.labelSingular;

  return (
    <StyledContent>
      {isDefined(selfTimelineActivityRule) && (
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconTimelineEvent}
            title={t`Log record changes`}
            description={t`Creation, updates, deletion and restoration of a ${objectLabelSingular} write entries on its own timeline.`}
            checked={selfTimelineActivityRule.isActive}
            disabled={isReadOnly}
            advancedMode
            onChange={handleToggleSelfRule}
          />
        </Card>
      )}
      {(timelineRuleRows.length > 0 || candidateRelations.length > 0) && (
        <>
          <SearchInput
            placeholder={t`Search a rule...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <SettingsObjectTimelineRulesTable
            timelineRuleRows={filteredTimelineRuleRows}
            isReadOnly={isReadOnly}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            onReset={handleReset}
          />
          {!isReadOnly && candidateRelations.length > 0 && (
            <StyledButtonContainer>
              <UndecoratedLink
                to={getSettingsPath(SettingsPath.ObjectNewTimelineRule, {
                  objectNamePlural: objectMetadataItem.namePlural,
                })}
              >
                <Button
                  Icon={IconPlus}
                  title={t`Add Rule`}
                  size="small"
                  variant="secondary"
                />
              </UndecoratedLink>
            </StyledButtonContainer>
          )}
        </>
      )}
    </StyledContent>
  );
};
