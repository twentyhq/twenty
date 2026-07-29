import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { FrontComponentExternalLinkModal } from '@/front-components/components/FrontComponentExternalLinkModal';
import { FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID } from '@/front-components/constants/FrontComponentExternalLinkModalId';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const OpenedModalDecorator: Decorator = (Story) => {
  jotaiStore.set(
    isModalOpenedComponentState.atomFamily({
      instanceId: FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID,
    }),
    true,
  );
  jotaiStore.set(focusStackState.atom, [
    {
      focusId: FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID,
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);

  return <Story />;
};

const meta: Meta<typeof FrontComponentExternalLinkModal> = {
  title: 'Modules/FrontComponents/FrontComponentExternalLinkModal',
  component: FrontComponentExternalLinkModal,
  decorators: [OpenedModalDecorator, RootDecorator, ComponentDecorator],
  parameters: {
    disableHotkeyInitialization: true,
  },
  args: {
    url: 'https://nvidia.com',
    shouldTrustOrigin: true,
    onShouldTrustOriginChange: fn(),
    onConfirm: fn(),
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentExternalLinkModal>;

export const Default: Story = {};

export const WithTrustedOriginUnchecked: Story = {
  args: {
    shouldTrustOrigin: false,
  },
};

export const WithLongUrl: Story = {
  args: {
    url: 'https://developer.nvidia.com/blog/category/generative-ai/very-long-article-slug?utm_source=twenty',
  },
};
