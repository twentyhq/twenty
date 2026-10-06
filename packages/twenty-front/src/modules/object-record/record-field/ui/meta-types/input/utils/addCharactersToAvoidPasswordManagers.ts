const ZERO_WIDTH_NON_JOINER = '‌';

// A non-joiner between two letters of a cursive script breaks the joined shape of the word
const JOINING_SCRIPT_FIRST_CHARACTER_PATTERN =
  /^[\p{Script=Adlam}\p{Script=Arabic}\p{Script=Chorasmian}\p{Script=Hanifi_Rohingya}\p{Script=Mandaic}\p{Script=Manichaean}\p{Script=Mongolian}\p{Script=Nko}\p{Script=Old_Uyghur}\p{Script=Phags_Pa}\p{Script=Psalter_Pahlavi}\p{Script=Sogdian}\p{Script=Syriac}]/u;

// Password managers autofill inputs whose placeholder reads like a name field
export const addCharactersToAvoidPasswordManagers = (placeholder: string) =>
  JOINING_SCRIPT_FIRST_CHARACTER_PATTERN.test(placeholder)
    ? placeholder
    : `${placeholder.slice(0, 1)}${ZERO_WIDTH_NON_JOINER}${ZERO_WIDTH_NON_JOINER}${placeholder.slice(1)}`;
