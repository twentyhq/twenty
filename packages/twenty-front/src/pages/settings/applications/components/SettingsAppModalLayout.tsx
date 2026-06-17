import { styled } from '@linaria/react';
import React from 'react';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { Button } from 'twenty-ui/input';
import {
  type ModalOverlay,
  type ModalPadding,
  type ModalSize,
  Section,
} from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type StyledAppModalBaseProps = React.PropsWithChildren<{
  modalId: string;
  size?: ModalSize;
  padding?: ModalPadding;
  overlay?: ModalOverlay;
  dataGloballyPreventClickOutside?: boolean;
}>;

type StyledAppModalProps = StyledAppModalBaseProps &
  (
    | { isClosable: true; onClose?: () => void }
    | { isClosable?: false; onClose?: never }
  );

const ModalWrapper = ({
  modalId,
  children,
  size,
  padding,
  overlay,
  dataGloballyPreventClickOutside,
  isClosable,
  onClose,
}: StyledAppModalBaseProps & { isClosable: boolean; onClose?: () => void }) =>
  isClosable ? (
    <ModalStatefulWrapper
      modalInstanceId={modalId}
      isClosable={true}
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
  ) : (
    <ModalStatefulWrapper
      modalInstanceId={modalId}
      isClosable={false}
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

export const StyledAppModal = (props: StyledAppModalProps) => (
  <ModalWrapper
    modalId={props.modalId}
    size={props.size}
    padding={props.padding}
    overlay={props.overlay}
    dataGloballyPreventClickOutside={props.dataGloballyPreventClickOutside}
    isClosable={props.isClosable ?? false}
    onClose={props.isClosable ? props.onClose : undefined}
  >
    {props.children}
  </ModalWrapper>
);

const StyledAppModalButtonContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const StyledAppModalButton = (
  props: React.ComponentProps<typeof Button>,
) => (
  <StyledAppModalButtonContainer>
    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
    <Button {...props} />
  </StyledAppModalButtonContainer>
);

export const StyledAppModalTitle = styled.div`
  text-align: center;
`;

const StyledAppModalSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

export const StyledAppModalSection = ({
  children,
  ...props
}: React.ComponentProps<typeof Section>) => (
  <StyledAppModalSectionContainer>
    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
    <Section {...props}>{children}</Section>
  </StyledAppModalSectionContainer>
);
