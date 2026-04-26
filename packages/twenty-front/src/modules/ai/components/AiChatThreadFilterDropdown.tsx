import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconAdjustments } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { AiChatThreadFilterDropdownContent } from '@/ai/components/AiChatThreadFilterDropdownContent';
import { type AiChatThreadActionsSurface } from '@/ai/constants/AiChatThreadActionsSurface';
import {
  AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE,
  type AiChatThreadFilterDropdownPage,
} from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { getAiChatThreadFilterDropdownId } from '@/ai/utils/getAiChatThreadFilterDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

type AiChatThreadFilterDropdownProps = {
  surface: AiChatThreadActionsSurface;
};

export const AiChatThreadFilterDropdown = ({
  surface,
}: AiChatThreadFilterDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = getAiChatThreadFilterDropdownId(surface);
  const [page, setPage] = useState<AiChatThreadFilterDropdownPage>(
    AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT,
  );

  const goToRoot = () => setPage(AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT);

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClose={goToRoot}
      clickableComponent={
        <LightIconButton
          aria-label={t`Filter chats`}
          Icon={IconAdjustments}
          accent="tertiary"
          size="small"
        />
      }
      dropdownComponents={
        <AiChatThreadFilterDropdownContent
          page={page}
          dropdownId={dropdownId}
          onSelectPage={setPage}
          onBack={goToRoot}
        />
      }
    />
  );
};
