SET check_function_bodies = false;
INSERT INTO public.users (id, email, created_at, updated_at, first_name, last_name, tenant_id) VALUES (1, 'charles@twenty.com', '2023-01-31 16:46:43.02666+00', '2023-01-31 16:46:43.02666+00', 'Charles', 'Bochet', 1);
INSERT INTO public.users (id, email, created_at, updated_at, first_name, last_name, tenant_id) VALUES (2, 'charles@ouihelp.twenty.com', '2023-01-31 16:46:49.72368+00', '2023-01-31 16:46:49.72368+00', 'Charles', 'Bochet', 2);
INSERT INTO public.users (id, email, created_at, updated_at, first_name, last_name, tenant_id) VALUES (3, 'felix@twenty.com', '2023-01-31 16:47:06.516066+00', '2023-01-31 16:47:06.516066+00', 'Félix', 'Malfait', 1);
INSERT INTO public.users (id, email, created_at, updated_at, first_name, last_name, tenant_id) VALUES (4, 'felix@ouihelp.twenty.com', '2023-01-31 16:47:13.684386+00', '2023-01-31 16:47:13.684386+00', 'Félix', 'Malfait', 2);
SELECT pg_catalog.setval('public.users_id_seq', 4, true);
