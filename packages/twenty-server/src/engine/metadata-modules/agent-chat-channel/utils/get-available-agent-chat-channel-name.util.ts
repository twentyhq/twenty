export const getAvailableAgentChatChannelName = ({
  name,
  takenNames,
}: {
  name: string;
  takenNames: string[];
}): string => {
  let availableName = name;

  for (let suffix = 2; takenNames.includes(availableName); suffix++) {
    availableName = `${name} ${suffix}`;
  }

  return availableName;
};
