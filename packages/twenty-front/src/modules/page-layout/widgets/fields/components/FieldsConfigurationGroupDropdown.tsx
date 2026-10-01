import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconNewSection,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

import { getFieldsConfigurationGroupEditDropdownId } from '@/page-layout/widgets/fields/utils/getFieldsConfigurationGroupEditDropdownId';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type FieldsConfigurationGroupDropdownProps = {
  groupId: string;
  onStartRename: () => void;
  onDelete: () => void;
  onAddGroup?: () => void;
};

export const FieldsConfigurationGroupDropdown = ({
  groupId,
  onStartRename,
  onDelete,
  onAddGroup,
}: FieldsConfigurationGroupDropdownProps) => {
  const { t } = useLingui();

  const dropdownId = getFieldsConfigurationGroupEditDropdownId(groupId);

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent width={GenericDropdownContentWidth.Narrow}>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPencil />}
            onClick={onStartRename}
          >{t`Rename`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconTrash />}
            onClick={onDelete}
            color="danger"
          >{t`Delete`}</Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconNewSection />}
            onClick={() => onAddGroup?.()}
          >{t`Add a Group`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
