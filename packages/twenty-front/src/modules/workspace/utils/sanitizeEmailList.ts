export const sanitizeEmailList = (emailList: string[]): string[] => {
  return Array.from(
    new Set(
      emailList
        .map((email) => email.trim())
        .filter((email) => email.length > 0),
    ),
  );
};
