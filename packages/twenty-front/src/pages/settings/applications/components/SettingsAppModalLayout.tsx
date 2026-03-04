import { styled } from '@linaria/react';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { type ModalOverlay, type ModalPadding, type ModalSize } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type StyledAppModalProps = React.PropsWithChildren<{
  modalId: string;
  isClosable?: boolean;
  onClose?: () => void;
  size?: ModalSize;
  padding?: ModalPadding;
  overlay?: ModalOverlay;
  dataGloballyPreventClickOutside?: boolean;
}>;

export const StyledAppModal = ({
  modalId,
  children,
  isClosable = false,
  onClose,
  size,
  padding,
  overlay,
  dataGloballyPreventClickOutside,
}: StyledAppModalProps) => (
  <ModalStatefulWrapper
    modalInstanceId={modalId}
    isClosable={isClosable as true}
    onClose={onClose}
    size={size}
    padding={padding}
    overlay={overlay}
    smallBorderRadius
    narrowWidth
    autoHeight
    dataGloballyPreventClickOutside={dataGloballyPreventClickOutside}
  >
    {children}
  </ModalStatefulWrapper>
);

export const StyledAppModalButton = styled(Button)`
  box-sizing: border-box;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const StyledAppModalTitle = styled.div`
  text-align: center;
`;

export const StyledAppModalSection = styled(Section)`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;
