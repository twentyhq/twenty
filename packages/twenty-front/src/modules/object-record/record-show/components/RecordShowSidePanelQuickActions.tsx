import { useRelatedRecordActions } from '@/activities/hooks/useRelatedRecordActions';
import { type RelatedRecordAction } from '@/activities/types/RelatedRecordAction';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordShowQuickCreateLinkedRecordButton } from '@/object-record/record-show/components/RecordShowQuickCreateLinkedRecordButton';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Fragment } from 'react';
import { IconPaperclip, IconPlus, type IconComponent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const LINKED_RECORD_OBJECT_NAMES_SINGULAR = [
  CoreObjectNameSingular.Opportunity,
  CoreObjectNameSingular.Person,
];

const StyledActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

type RecordShowSidePanelQuickActionsProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const RecordShowSidePanelQuickActions = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowSidePanelQuickActionsProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();

  const relatedRecordActions = useRelatedRecordActions({
    targetRecord: {
      id: objectRecordId,
      targetObjectNameSingular: objectNameSingular,
    },
  });

  const linkedObjectMetadataItems = LINKED_RECORD_OBJECT_NAMES_SINGULAR.map(
    (linkedObjectNameSingular) =>
      objectMetadataItems.find(
        (item) => item.nameSingular === linkedObjectNameSingular,
      ),
  ).filter(isDefined);

  const activityButtons: {
    actionId: RelatedRecordAction['id'];
    label: string;
    Icon: IconComponent;
  }[] = [
    { actionId: 'create-note', label: t`Note`, Icon: IconPlus },
    { actionId: 'create-task', label: t`Task`, Icon: IconPlus },
    { actionId: 'attach-file', label: t`File`, Icon: IconPaperclip },
  ];

  return (
    <StyledActionsRow>
      {linkedObjectMetadataItems.map((linkedObjectMetadataItem) => (
        <RecordShowQuickCreateLinkedRecordButton
          key={linkedObjectMetadataItem.id}
          linkedObjectMetadataItem={linkedObjectMetadataItem}
          targetObjectMetadataId={objectMetadataItem.id}
          targetRecordId={objectRecordId}
        />
      ))}
      {activityButtons.map(({ actionId, label, Icon }) => {
        const binding = relatedRecordActions.find(
          ({ action }) => action.id === actionId,
        );

        if (!isDefined(binding) || !binding.action.isVisible) {
          return null;
        }

        return (
          <Fragment key={actionId}>
            {binding.supportElement}
            <Button
              size="sm"
              variant="outline"
              startIcon={<Icon />}
              disabled={binding.action.disabled}
              onClick={binding.action.execute}
            >
              {label}
            </Button>
          </Fragment>
        );
      })}
    </StyledActionsRow>
  );
};
