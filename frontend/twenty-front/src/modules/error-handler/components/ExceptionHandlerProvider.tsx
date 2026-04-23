import { SentryInitEffect } from '@/error-handler/components/SentryInitEffect';

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
