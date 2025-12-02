// TODO: merge with getFirstNonEmptyLineOfRichText (and one duplicate I saw and also added a note on)

export const getActivityPreview = (activityBody: string | null) => {
  const noteBody = activityBody ? JSON.parse(activityBody) : [];

  const extractText = (node: any): string => {
    if (!node) return '';

    if (node.type === 'text') {
        return node.text ?? '';
    }

    if (node.type === 'link') {
      const innerText = (node.content ?? [])
        .map((child: any) => extractText(child))
        .join('');

      const href = node.href ?? '';

      return href ? `${innerText} (${href})` : innerText;
    }

    if (Array.isArray(node.content)) {
      return node.content.map(extractText).join(' ');
    }

    return '';
  };

  return noteBody.length
    ? noteBody
        .map((x: any) => extractText(x))
        .filter((x: string) => x)
        .join('\n')
    : '';
};
