export const getActivityPreview = (activityBody: string) => {
  const noteBody = activityBody ? JSON.parse(activityBody) : [];

  return noteBody.length
    ? noteBody
        .map((x: any) =>
          Array.isArray(x.content)
            ? x.content?.map((content: any) => content?.text).join(' ')
            : x.content?.text,
        )
        .filter((x: string) => x)
        .join('\n')
    : '';
};
