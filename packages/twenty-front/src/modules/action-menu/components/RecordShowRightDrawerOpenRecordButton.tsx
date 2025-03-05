import { RightDrawerActionMenuDropdownHotkeyScope } from '@/action-menu/types/RightDrawerActionMenuDropdownHotkeyScope';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { AppPath } from '@/types/AppPath';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { Button, IconBrowserMaximize, getOsControlSymbol } from 'twenty-ui';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

type RecordShowRightDrawerOpenRecordButtonProps = {
  objectNameSingular: string;
  record: ObjectRecord;
};

export const RecordShowRightDrawerOpenRecordButton = ({
  objectNameSingular,
  record,
}: RecordShowRightDrawerOpenRecordButtonProps) => {
  const { closeCommandMenu } = useCommandMenu();

  const to = getLinkToShowPage(objectNameSingular, record);

  const navigate = useNavigateApp();

  const handleOpenRecord = () => {
    navigate(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: record.id,
    });
    closeCommandMenu();
  };

  useScopedHotkeys(
    ['ctrl+Enter,meta+Enter'],
    handleOpenRecord,
    AppHotkeyScope.CommandMenuOpen,
    [closeCommandMenu, navigate, objectNameSingular, record.id],
  );

  useScopedHotkeys(
    ['ctrl+Enter,meta+Enter'],
    handleOpenRecord,
    RightDrawerActionMenuDropdownHotkeyScope.RightDrawerActionMenuDropdown,
    [closeCommandMenu, navigate, objectNameSingular, record.id],
  );

  return (
    <StyledLink to={to} onClick={closeCommandMenu}>
      <Button
        title="Open"
        variant="primary"
        accent="blue"
        size="medium"
        Icon={IconBrowserMaximize}
        hotkeys={[getOsControlSymbol(), '⏎']}
      />
    </StyledLink>
  );
};
