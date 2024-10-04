// TODO: merge with getFirstNonEmptyLineOfRichText (and one duplicate I saw and also added a note on)

export const getActivityPreview = (activityBody: string | null) => {
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
