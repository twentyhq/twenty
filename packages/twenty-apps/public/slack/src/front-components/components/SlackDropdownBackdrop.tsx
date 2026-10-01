import styled from '@emotion/styled';

const StyledBackdrop = styled.div`
  inset: 0;
  position: fixed;
  z-index: 1;
`;

type SlackDropdownBackdropProps = {
  onClose: () => void;
};

export const SlackDropdownBackdrop = ({
  onClose,
}: SlackDropdownBackdropProps) => <StyledBackdrop onClick={onClose} />;
