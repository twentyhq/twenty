import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { IconHelpCircle } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { Button } from '@/ui/input/button/components/Button';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { User } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const StyledButtonContainer = styled.div`
  display: flex;
`;

const insertScript = ({
  src,
  innerHTML,
  onLoad,
}: {
  src?: string;
  innerHTML?: string;
  onLoad?: (...args: any[]) => void;
}) => {
  const script = document.createElement('script');
  if (isNonEmptyString(src)) script.src = src;
  if (isNonEmptyString(innerHTML)) script.innerHTML = innerHTML;
  if (isDefined(onLoad)) script.onload = onLoad;
  document.body.appendChild(script);
};

export const SupportChat = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const supportChat = useRecoilValue(supportChatState);
  const [isFrontChatLoaded, setIsFrontChatLoaded] = useState(false);

  const configureFront = useCallback(
    (
      chatId: string,
      currentUser: Pick<User, 'email' | 'supportUserHash'>,
      currentWorkspaceMember: Pick<WorkspaceMember, 'name'>,
    ) => {
      const url = 'https://chat-assets.frontapp.com/v1/chat.bundle.js';
      let script = document.querySelector(`script[src="${url}"]`);

      // This function only gets called when front chat is not loaded
      // If the script is already defined, but front chat is not loaded
      // then there was an error loading the script; reload the script
      if (isDefined(script)) {
        script.parentNode?.removeChild(script);
        script = null;
      }

      insertScript({
        src: url,
        onLoad: () => {
          window.FrontChat?.('init', {
            chatId,
            useDefaultLauncher: false,
            email: currentUser.email,
            name:
              currentWorkspaceMember.name.firstName +
              ' ' +
              currentWorkspaceMember.name.lastName,
            userHash: currentUser?.supportUserHash,
          });
          setIsFrontChatLoaded(true);
        },
      });
    },
    [],
  );

  useEffect(() => {
    if (
      supportChat?.supportDriver === 'front' &&
      isNonEmptyString(supportChat.supportFrontChatId) &&
      isNonEmptyString(currentUser?.email) &&
      isDefined(currentWorkspaceMember) &&
      !isFrontChatLoaded
    ) {
      configureFront(
        supportChat.supportFrontChatId,
        currentUser,
        currentWorkspaceMember,
      );
    }
  }, [
    configureFront,
    currentUser,
    isFrontChatLoaded,
    supportChat?.supportDriver,
    supportChat.supportFrontChatId,
    currentWorkspaceMember,
  ]);

  return isFrontChatLoaded ? (
    <StyledButtonContainer>
      <Button
        variant="tertiary"
        size="small"
        title="Support"
        Icon={IconHelpCircle}
        onClick={() => window.FrontChat?.('show')}
      />
    </StyledButtonContainer>
  ) : null;
};
