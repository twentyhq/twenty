import { AppToaster } from '@/ui/feedback/toast/components/AppToaster';
import { useState, type ReactNode } from 'react';

type ToastStoryContainerProps = {
  children: ReactNode;
};

export const ToastStoryContainer = ({ children }: ToastStoryContainerProps) => {
  const [toastContainer, setToastContainer] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <div ref={setToastContainer}>
      <AppToaster
        container={toastContainer}
        getToastProps={() => ({ progress: 100 })}
      />
      {children}
    </div>
  );
};
