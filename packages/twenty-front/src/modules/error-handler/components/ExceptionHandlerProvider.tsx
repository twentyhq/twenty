import { SentryInitEffect } from '@/error-handler/components/SentryInitiEffect';

export const ExceptionHandlerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <SentryInitEffect />
      {children}
    </>
  );
};
