import { useFetchCurrentUser } from '@/auth/hooks/useFetchCurrentUser';

export const UserProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  useFetchCurrentUser();

  return <>{children}</>;
};
