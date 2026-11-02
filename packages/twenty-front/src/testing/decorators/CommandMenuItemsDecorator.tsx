import { type Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';

import { CommandRunner } from '@/command-menu-item/engine-command/components/CommandRunner';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';

const CommandMenuItemsLoadEffect = () => {
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

  useEffect(() => {
    replaceDraft('commandMenuItems', mockedCommandMenuItems);
    applyChanges();
  }, [replaceDraft, applyChanges]);

  return null;
};

export const CommandMenuItemsDecorator: Decorator = (Story) => (
  <>
    <CommandMenuItemsLoadEffect />
    <CommandRunner />
    <Story />
  </>
);
