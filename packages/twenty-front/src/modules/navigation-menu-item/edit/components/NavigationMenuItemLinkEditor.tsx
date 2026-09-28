import { useState } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ensureAbsoluteUrl, isDefined, isValidUrl } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
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
  const saveLink = ({
    firstValue,
    secondValue,
  }: {
    firstValue: string;
    secondValue: string;
  }) => {
    const link = ensureAbsoluteUrl(secondValue.trim());
    if (!isValidUrl(link)) {
      setError(true);
      return;
    }
    void updateItem(item.id, { name: firstValue.trim(), link });
    onClose();
  };
  return (
    <>
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
        onChange={() => setError(false)}
      />
      {error && <StyledError role="alert">{t`Enter a valid URL`}</StyledError>}
    </>
  );
};
