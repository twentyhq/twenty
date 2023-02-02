SET check_function_bodies = false;
INSERT INTO public.tenants (id, name, uuid, email_domain) VALUES (1, 'pilot', '8375f69d-47bd-4baa-a3c1-f8aaef8d8b2b', 'twenty.com');
INSERT INTO public.tenants (id, name, uuid, email_domain) VALUES (2, 'ouihelp', 'c71becee-2cd6-4b31-827e-6cbef4e66879', 'ouihelp.twenty.com');
SELECT pg_catalog.setval('public.tenants_id_seq', 2, true);
