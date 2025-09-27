import { type CurrentUser } from '@/auth/states/currentUserState';

export const getUserName = (user: CurrentUser | null): string => {
  if (!user) {
    return 'Unknown User';
  }

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  if (lastName) {
    return lastName;
  }
  
  return user.email || 'Unknown User';
};
