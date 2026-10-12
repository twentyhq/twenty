export const navigateWithPost = (url: string) => {
  const form = document.createElement('form');

  form.method = 'post';
  form.action = url;

  document.body.appendChild(form);
  form.submit();
};
