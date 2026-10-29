import { type MessageDescriptor } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { GETTING_STARTED_STEP_CONTENT } from 'src/engine/core-modules/getting-started/constants/getting-started-step-content.constant';
import { GETTING_STARTED_WORKFLOWS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflows.constant';
import { type GettingStartedStepDefinitionDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-step-definition.dto';
import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { type GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

export const buildGettingStartedStepDefinition = ({
  step,
  translate,
}: {
  step: GettingStartedStep;
  translate: (descriptor: MessageDescriptor) => string;
}): GettingStartedStepDefinitionDTO => {
  const { title, doneTitle, description, icon, iconColor, prompt } =
    GETTING_STARTED_STEP_CONTENT[step];

  return {
    step,
    kind: isDefined(GETTING_STARTED_WORKFLOWS[step])
      ? GettingStartedStepKind.WORKFLOW
      : isDefined(prompt)
        ? GettingStartedStepKind.PROMPT
        : GettingStartedStepKind.CUSTOM,
    title: translate(title),
    doneTitle: translate(doneTitle),
    description: translate(description),
    icon,
    iconColor,
    promptLabel: isDefined(prompt) ? translate(prompt.label) : null,
    prompt: isDefined(prompt) ? translate(prompt.text) : null,
  };
};
