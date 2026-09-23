import { EditLinkPopoverForm } from '@/advanced-text-editor/components/EditLinkPopoverForm';
import { type EditLinkEditor } from '@/advanced-text-editor/types/EditLinkEditor';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconLink, IconPencil } from 'twenty-ui/icon';

type EditLinkPopoverProps = {
  dropdownId: string;
  defaultValue: string | undefined;
  editor: EditLinkEditor;
};

export const EditLinkPopover = ({
  dropdownId,
  defaultValue = '',
  editor,
}: EditLinkPopoverProps) => {
  const isActive = isNonEmptyString(defaultValue);
  const { t } = useLingui();

  return (
    <DropdownRoot dropdownId={dropdownId} type="panel">
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={isActive ? t`Edit link` : t`Add link`}
            aria-pressed={isActive}
            emphasis={isActive ? 'standard' : 'subtle'}
            size="sm"
          >
            {isActive ? <IconPencil /> : <IconLink />}
          </LightIconButton>
        }
      />
      <Dropdown.Content
        sideOffset={0}
        align="end"
        finalFocus={(interaction) =>
          interaction === 'keyboard' ? editor.view.dom : false
        }
        aria-label={isActive ? t`Edit link` : t`Add link`}
      >
        <Dropdown.Section>
          <EditLinkPopoverForm defaultValue={defaultValue} editor={editor} />
        </Dropdown.Section>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
