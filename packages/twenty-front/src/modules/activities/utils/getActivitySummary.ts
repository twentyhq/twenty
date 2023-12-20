export const getActivitySummary = (activityBody: string) => {
  const noteBody = activityBody ? JSON.parse(activityBody) : [];

  return (
    noteBody[0]?.content?.text ||
    noteBody[0]?.content?.map((content: any) => content?.text).join(' ') ||
    ''
  );
};
