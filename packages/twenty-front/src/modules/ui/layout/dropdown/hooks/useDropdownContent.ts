import {
  DropdownContentContext,
  DropdownContentContextValue,
} from '@/ui/layout/dropdown/components/DropdownContentProvider';
import { useContext } from 'react';

export const useDropdownContent = <Key extends string>() => {
  const context = useContext(
    DropdownContentContext,
  ) as DropdownContentContextValue<Key>;

  if (!context) {
    throw new Error(
      'useDropdownContent must be used within a DropdownContentProvider',
    );
  }

  return context;
};
