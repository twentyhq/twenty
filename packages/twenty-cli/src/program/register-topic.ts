import { type Command } from 'commander';
import { isDefined } from 'twenty-shared/utils';

import { type CommandTopicDefinition } from '@/catalog/types/command-topic-definition.type';
import { getCommandByPath } from '@/program/find-command-by-path';
import { throwParseErrorOnExit } from '@/program/throw-parse-error-on-exit';

export const registerTopic = ({
  program,
  topic,
}: {
  program: Command;
  topic: CommandTopicDefinition;
}) => {
  const parent = getCommandByPath(program, topic.path.slice(0, -1));
  const topicCommand = parent
    .command(topic.path[topic.path.length - 1])
    .description(topic.description);

  if (isDefined(topic.helpGroup)) {
    topicCommand.helpGroup(topic.helpGroup);
  }

  throwParseErrorOnExit(topicCommand, topic.path.join(' '));
};
