import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  SETTINGS_SELECT_MENU_BACKDROP_Z_INDEX,
  SETTINGS_SELECT_MENU_GAP_PIXELS,
  SETTINGS_SELECT_MENU_MAX_HEIGHT_PIXELS,
  SETTINGS_SELECT_MENU_WIDTH_PIXELS,
  SETTINGS_SELECT_MENU_Z_INDEX,
} from 'src/front-components/constants/settings-select-menu.constant';

// The sandbox cannot portal into the host document, so the menu opens inline
// below its control, and the backdrop stands in for the outside click the
// host page never forwards to the front component.
const StyledBackdrop = styled.div`
  inset: 0;
  position: fixed;
  z-index: ${SETTINGS_SELECT_MENU_BACKDROP_Z_INDEX};
`;

const StyledMenu = styled.div`
  background-color: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-shadow: ${() => themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  max-height: ${SETTINGS_SELECT_MENU_MAX_HEIGHT_PIXELS}px;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: calc(100% + ${SETTINGS_SELECT_MENU_GAP_PIXELS}px);
  width: ${SETTINGS_SELECT_MENU_WIDTH_PIXELS}px;
  z-index: ${SETTINGS_SELECT_MENU_Z_INDEX};
`;

type SettingsSelectMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const SettingsSelectMenu = ({
  isOpen,
  onClose,
  children,
}: SettingsSelectMenuProps) => (
  <>
    <StyledBackdrop
      aria-hidden={!isOpen}
      style={{ display: isOpen ? 'block' : 'none' }}
      onClick={onClose}
    />
    <StyledMenu
      aria-hidden={!isOpen}
      style={{ display: isOpen ? 'flex' : 'none' }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      {children}
    </StyledMenu>
  </>
);
