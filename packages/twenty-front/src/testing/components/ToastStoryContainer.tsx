import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';

// CI zeroes animation durations, which would immediately dismiss toasts.
const StyledStoryContainer = styled.div`
  [role='status'] * {
    animation: none !important;
  }
`;

type ToastStoryContainerProps = {
  children: ReactNode;
};

export const ToastStoryContainer = ({ children }: ToastStoryContainerProps) => {
  const [toastContainer, setToastContainer] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <StyledStoryContainer ref={setToastContainer}>
      <AppToaster container={toastContainer} />
      {children}
    </StyledStoryContainer>
  );
};
