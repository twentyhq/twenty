import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';
import { type ToolInput } from '@/ai/types/ToolInput';
import { buildToolStatusMessageByCategory } from '@/ai/utils/tool-display/build-tool-status-message-by-category.util';
import { extractSearchQuery } from '@/ai/utils/tool-display/extract-search-query.util';
import { getInnerToolName } from '@/ai/utils/tool-display/get-inner-tool-name.util';
import { pickStatusLabel } from '@/ai/utils/tool-display/pick-status-label.util';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrap-tool-input.util';

const ModelGeneratedLabelSchema = z.object({
  loadingMessage: z.string(),
  completedMessage: z.string().optional(),
});
const LearnToolsSchema = z.object({ toolNames: z.array(z.string()) });
const LoadSkillsSchema = z.object({ skillNames: z.array(z.string()) });

export const getToolDisplayMessage = ({
  input,
  toolName,
  isFinished,
  displayContext,
  output,
}: {
  input: ToolInput;
  toolName: string;
  isFinished: boolean;
  displayContext: ToolDisplayContext;
  output?: unknown;
}): string => {
  const { toolInput, toolName: resolvedToolName } = unwrapToolInput({
    input,
    toolName,
  });

  return buildToolDisplayMessage({
    input: toolInput,
    toolName: resolvedToolName,
    isFinished,
    displayContext,
    output,
  });
};

const buildToolDisplayMessage = ({
  input,
  toolName,
  isFinished,
  displayContext,
  output,
}: {
  input: ToolInput;
  toolName: string;
  isFinished: boolean;
  displayContext: ToolDisplayContext;
  output?: unknown;
}): string => {
  switch (toolName) {
    case 'web_search':
    case 'app_exa_web_search': {
      const query = extractSearchQuery(input);

      if (isNonEmptyString(query)) {
        return pickStatusLabel({
          isFinished,
          completedLabel: t`Searched the web for ${query}`,
          loadingLabel: t`Searching the web for ${query}`,
        });
      }

      return pickStatusLabel({
        isFinished,
        completedLabel: t`Searched the web`,
        loadingLabel: t`Searching the web`,
      });
    }
    case 'learn_tools': {
      const parsed = LearnToolsSchema.safeParse(input);

      if (parsed.success && parsed.data.toolNames.length > 0) {
        const labels: string[] = [];

        for (const name of parsed.data.toolNames) {
          labels.push(
            getInnerToolName({
              toolName: name,
              labelByName: displayContext.labelByName,
              output,
            }),
          );
        }

        const names = labels.join(', ');

        return pickStatusLabel({
          isFinished,
          completedLabel: t`Learned ${names}`,
          loadingLabel: t`Learning ${names}`,
        });
      }

      return pickStatusLabel({
        isFinished,
        completedLabel: t`Learned tools`,
        loadingLabel: t`Learning tools...`,
      });
    }
    case 'load_skills': {
      const parsed = LoadSkillsSchema.safeParse(input);

      if (parsed.success && parsed.data.skillNames.length > 0) {
        const labels: string[] = [];

        for (const name of parsed.data.skillNames) {
          labels.push(
            getInnerToolName({
              toolName: name,
              labelByName: displayContext.labelByName,
              output,
            }),
          );
        }

        const names = labels.join(', ');

        return pickStatusLabel({
          isFinished,
          completedLabel: t`Loaded ${names}`,
          loadingLabel: t`Loading ${names}`,
        });
      }

      return pickStatusLabel({
        isFinished,
        completedLabel: t`Loaded skills`,
        loadingLabel: t`Loading skills...`,
      });
    }
    case 'code_interpreter': {
      const parsed = ModelGeneratedLabelSchema.safeParse(input);

      if (parsed.success) {
        return pickStatusLabel({
          isFinished,
          completedLabel:
            parsed.data.completedMessage ?? parsed.data.loadingMessage,
          loadingLabel: parsed.data.loadingMessage,
        });
      }

      return pickStatusLabel({
        isFinished,
        completedLabel: t`Ran code`,
        loadingLabel: t`Running code`,
      });
    }
    default:
      return buildToolStatusMessageByCategory({
        toolName,
        isFinished,
        displayContext,
      });
  }
};
