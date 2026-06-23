import { useMemo, useState } from 'react';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useTimelineProjectionRules } from '@/settings/timeline/hooks/useTimelineProjectionRules';
import {
  buildTimelineProjectionRuleRows,
  type TimelineProjectionRuleRow,
} from '@/settings/timeline/utils/buildTimelineProjectionRuleRows';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsObjectTimelineSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const DELETE_TIMELINE_RULE_MODAL_ID = 'delete-timeline-rule-modal';

export const SettingsObjectTimelineSection = ({
  objectMetadataItem,
}: SettingsObjectTimelineSectionProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { openModal, closeModal } = useModal();

  const { rules, deleteRule } = useTimelineProjectionRules();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const [ruleIdToDelete, setRuleIdToDelete] = useState<string | null>(null);

  const labelByObjectMetadataId = useMemo(
    () =>
      new Map(objectMetadataItems.map((item) => [item.id, item.labelSingular])),
    [objectMetadataItems],
  );

  const items = buildTimelineProjectionRuleRows({
    rules,
    anchorObjectMetadataId: objectMetadataItem.id,
    labelByObjectMetadataId,
    unknownLabel: t`Unknown`,
  });

  const requestDelete = (ruleId: string) => {
    setRuleIdToDelete(ruleId);
    openModal(DELETE_TIMELINE_RULE_MODAL_ID);
  };

  const confirmDelete = async () => {
    if (ruleIdToDelete === null) {
      return;
    }

    await deleteRule(ruleIdToDelete);
    setRuleIdToDelete(null);
    closeModal(DELETE_TIMELINE_RULE_MODAL_ID);
  };

  return (
    <>
      <SettingsTableListSection<TimelineProjectionRuleRow>
        title={t`Timeline`}
        description={t`Inherit notes & tasks from records related to this object.`}
        items={items}
        columns={[
          {
            label: t`Inherits from`,
            Cell: ({ item }) => <>{item.sourceLabel}</>,
          },
          {
            label: t`Activities`,
            Cell: ({ item }) => <>{item.activitiesLabel}</>,
          },
          {
            label: '',
            align: 'right',
            Cell: ({ item }) => (
              <LightIconButton
                Icon={IconTrash}
                accent="tertiary"
                onClick={(event) => {
                  event.stopPropagation();
                  requestDelete(item.id);
                }}
              />
            ),
          },
        ]}
        gridAutoColumns="3fr 3fr 1fr"
        onRowClick={(item) =>
          navigate(SettingsPath.ObjectTimelineRuleDetail, {
            objectNamePlural: objectMetadataItem.namePlural,
            timelineProjectionRuleId: item.id,
          })
        }
        footerButtonLabel={t`Add rule`}
        onFooterButtonClick={() =>
          navigate(SettingsPath.ObjectNewTimelineRule, {
            objectNamePlural: objectMetadataItem.namePlural,
          })
        }
      />
      <ConfirmationModal
        modalInstanceId={DELETE_TIMELINE_RULE_MODAL_ID}
        title={t`Delete this rule?`}
        subtitle={t`This object's timeline will stop inheriting the related activities. You can recreate it later.`}
        confirmButtonText={t`Delete`}
        onConfirmClick={confirmDelete}
        onClose={() => setRuleIdToDelete(null)}
      />
    </>
  );
};
