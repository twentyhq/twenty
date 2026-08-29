// `stack` is required: a string stack is the discriminator that tells a real
// thrown value (Error, DOMException, Firefox Gecko Exception) apart from a plain
// data object that merely happens to carry `name` and `message` fields.
export type ErrorLikeValue = {
  name: string;
  message: string;
  stack: string;
};
