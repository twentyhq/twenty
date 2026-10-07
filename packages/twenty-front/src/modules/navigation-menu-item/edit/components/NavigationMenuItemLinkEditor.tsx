import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type KeyboardEvent, useState } from 'react';
import { Key } from 'ts-key-enum';
import { type FieldDoubleText } from '@/object-record/record-field/ui/types/FieldDoubleText';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isSafeInternalPath, isValidUrl } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemComputedLink';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

type NavigationMenuItemLinkEditorProps = {
  item: NavigationMenuItem;
  dropdownId: string;
  onClose: () => void;
};

export const NavigationMenuItemLinkEditor = ({
  item,
  dropdownId,
  onClose,
}: NavigationMenuItemLinkEditorProps) => {
  const { t } = useLingui();
  const { updateItem } = useNavigationMenuItemEditController(
    isDefined(item.userWorkspaceId) ? 'favorite' : 'workspace',
  );
  const [error, setError] = useState(false);
  const [value, setValue] = useState<FieldDoubleText>({
    firstValue: item.name ?? '',
    secondValue: item.link ?? '',
  });
  const saveLink = ({
    firstValue,
    secondValue,
  }: {
    firstValue: string;
    secondValue: string;
  }) => {
    const link = getLinkNavigationMenuItemComputedLink({ link: secondValue });
    if (!isValidUrl(link) && !isSafeInternalPath(link)) {
      setError(true);
      return;
    }
    void updateItem(item.id, { name: firstValue.trim(), link });
    onClose();
  };
  const handleEditorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEventComposing(event.nativeEvent)) {
      return;
    }

    if (event.key === Key.Enter) {
      event.preventDefault();
      saveLink(value);
      return;
    }

    if (event.key !== Key.Tab) {
      return;
    }

    const inputs = event.currentTarget.querySelectorAll('input');
    const edgeInput = event.shiftKey ? inputs[0] : inputs[inputs.length - 1];

    if (event.target === edgeInput) {
      event.preventDefault();
    }
  };
  return (
    <Dropdown.Page id="root" type="panel">
      <div onKeyDown={handleEditorKeyDown}>
        <DoubleTextInput
          instanceId={dropdownId}
          selectOnFocus
          firstValue={item.name ?? ''}
          secondValue={item.link ?? ''}
          firstValuePlaceholder={t`Link label`}
          secondValuePlaceholder={t`URL`}
          onEnter={saveLink}
          onEscape={onClose}
          onClickOutside={(_, value) => saveLink(value)}
          onChange={(nextValue) => {
            setValue(nextValue);
            setError(false);
          }}
        />
        {error && (
          <StyledError role="alert">{t`Enter a valid URL`}</StyledError>
        )}
      </div>
    </Dropdown.Page>
  );
};
