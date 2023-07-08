import React from 'react';
import styled from '@emotion/styled';

import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { Modal as UIModal } from '@/ui/components/modal/Modal';

type Props = React.ComponentProps<'div'>;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(10)};
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

export function AuthModal({ children, ...restProps }: Props) {
  useHotkeysScopeOnMountOnly({
    scope: InternalHotkeysScope.Modal,
    customScopes: { 'command-menu': false, goto: false },
  });

  return (
    <UIModal isOpen={true}>
      <StyledContainer {...restProps}>{children}</StyledContainer>
    </UIModal>
  );
}
