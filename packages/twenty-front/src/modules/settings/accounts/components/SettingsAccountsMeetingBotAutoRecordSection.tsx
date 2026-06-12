import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { findMeetingBotAutoRecordEnabledFieldMetadataItem } from '@/settings/accounts/utils/findMeetingBotAutoRecordEnabledFieldMetadataItem';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconRobot } from 'twenty-ui-deprecated/display';
import { Card, Section } from 'twenty-ui-deprecated/layout';

export const SettingsAccountsMeetingBotAutoRecordSection = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  const autoRecordFieldMetadataItem =
    findMeetingBotAutoRecordEnabledFieldMetadataItem(
      workspaceMemberObjectMetadataItem,
    );

  const { record: workspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    recordGqlFields: {
      id: true,
      ...(isDefined(autoRecordFieldMetadataItem)
        ? { [autoRecordFieldMetadataItem.name]: true }
        : {}),
    },
    skip:
      !isDefined(autoRecordFieldMetadataItem) ||
      !isDefined(currentWorkspaceMember),
  });

  const { updateOneRecord } = useUpdateOneRecord();

  if (
    !isDefined(autoRecordFieldMetadataItem) ||
    !isDefined(workspaceMemberRecord)
  ) {
    return null;
  }

  const isAutoRecordEnabled =
    workspaceMemberRecord[autoRecordFieldMetadataItem.name] === true;

  const handleToggle = (checked: boolean) => {
    void updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      idToUpdate: workspaceMemberRecord.id,
      updateOneRecordInput: {
        [autoRecordFieldMetadataItem.name]: checked,
      },
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Meeting recording`}
        description={t`Record meetings synced from your calendars`}
      />
      <Card rounded>
        <SettingsOptionCardContentToggle
          Icon={IconRobot}
          title={t`Auto-record meetings`}
          description={t`Twenty Meeting Bot joins and records your upcoming meetings that have a conference link`}
          checked={isAutoRecordEnabled}
          onChange={handleToggle}
        />
      </Card>
    </Section>
  );
};
