export const isGroupEmail = (email: string): boolean => {
  const isGroupPattern =
    /noreply|no-reply|do_not_reply|no\.reply|^(info@|contact@|hello@|support@|feedback@|service@|help@|invites@|invite@|welcome@|alerts@|team@|notifications@|notification@|news@)/;

  return isGroupPattern.test(email);
};
