import { type JSONContent, reactMarkupFromJSON, render } from 'twenty-emails';

export const renderRichTextToHtml = async (
  jsonContent: JSONContent,
): Promise<string> => {
  const reactMarkup = reactMarkupFromJSON(jsonContent);

  return render(reactMarkup);
};
