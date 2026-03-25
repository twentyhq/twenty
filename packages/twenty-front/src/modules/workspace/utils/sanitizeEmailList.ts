export const sanitizeEmailList = (emailList: string[]): string[] => {
  return Array.from(
    new Set(
      emailList
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    ),
  );
};
