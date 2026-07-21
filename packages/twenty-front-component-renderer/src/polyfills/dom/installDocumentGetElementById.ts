type DocumentWithGetElementById = {
  getElementById?: unknown;
  querySelector?: (selector: string) => unknown;
};

export const installDocumentGetElementById = (
  documentTarget: DocumentWithGetElementById,
): void => {
  if (
    typeof documentTarget.getElementById === 'function' ||
    typeof documentTarget.querySelector !== 'function'
  ) {
    return;
  }

  const querySelector = documentTarget.querySelector.bind(documentTarget);

  documentTarget.getElementById = (elementId: string) => {
    try {
      return querySelector(`#${elementId}`) ?? null;
    } catch {
      return null;
    }
  };
};
